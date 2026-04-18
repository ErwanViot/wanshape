import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders as getSharedCorsHeaders } from "../_shared/cors.ts";
import { verifyStripeSignature } from "./verify-signature.ts";

// Thin wrapper preserving the existing `(origin?: string)` signature while
// delegating origin whitelisting to the shared module. `stripe-signature`
// must be reflected in Allow-Headers for Stripe's preflight.
function getCorsHeaders(origin?: string) {
  const req = new Request("https://edge.local/", {
    headers: origin ? { origin } : undefined,
  });
  return getSharedCorsHeaders(req, { extraAllowedHeaders: ["stripe-signature"] });
}

function jsonResponse(data: unknown, status = 200, origin?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400, origin?: string) {
  return jsonResponse({ error: message }, status, origin);
}

// Determine subscription tier from Stripe status
function tierFromStatus(status: string): "premium" | "free" {
  return ["active", "trialing"].includes(status) ? "premium" : "free";
}

// Resolve user_id from subscription metadata, with DB fallback (CRITICAL fix #4)
async function resolveUserId(
  supabase: ReturnType<typeof createClient>,
  metadata: Record<string, string> | undefined,
  stripeSubscriptionId: string,
): Promise<string | null> {
  const userId = metadata?.user_id;
  if (userId) return userId;

  // Fallback: look up from subscriptions table
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  return data?.user_id ?? null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") ?? undefined;

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405, origin);
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!webhookSecret || !stripeSecretKey) {
    return errorResponse("Stripe secrets not configured", 500, origin);
  }

  const sigHeader = req.headers.get("stripe-signature");
  if (!sigHeader) {
    return errorResponse("Missing stripe-signature header", 400, origin);
  }

  const body = await req.text();

  // Verify signature
  const isValid = await verifyStripeSignature(body, sigHeader, webhookSecret);
  if (!isValid) {
    return errorResponse("Invalid signature", 401, origin);
  }

  // Safe JSON parse (MINOR fix #13)
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return errorResponse("Invalid JSON body", 400, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Atomic idempotency: INSERT ON CONFLICT DO NOTHING (CRITICAL fix #2 + #3)
  // If the insert succeeds, we process. If it conflicts, it's a duplicate.
  const { data: inserted } = await supabaseAdmin
    .from("stripe_webhook_events")
    .upsert(
      { id: event.id, type: event.type },
      { onConflict: "id", ignoreDuplicates: true },
    )
    .select("id");

  if (!inserted || inserted.length === 0) {
    return jsonResponse({ received: true, duplicate: true }, 200, origin);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(supabaseAdmin, stripeSecretKey, (event as Record<string, Record<string, unknown>>).data.object as Record<string, unknown>);
        break;
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(supabaseAdmin, (event as Record<string, Record<string, unknown>>).data.object as Record<string, unknown>);
        break;
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(supabaseAdmin, (event as Record<string, Record<string, unknown>>).data.object as Record<string, unknown>);
        break;
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(supabaseAdmin, (event as Record<string, Record<string, unknown>>).data.object as Record<string, unknown>);
        break;
      }
      case "invoice.payment_succeeded": {
        await handlePaymentSucceeded(supabaseAdmin, (event as Record<string, Record<string, unknown>>).data.object as Record<string, unknown>);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    // Delete idempotency record so Stripe can retry (CRITICAL fix #3)
    await supabaseAdmin
      .from("stripe_webhook_events")
      .delete()
      .eq("id", event.id as string);
    return errorResponse("Webhook processing error", 500, origin);
  }

  return jsonResponse({ received: true }, 200, origin);
});

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createClient>,
  stripeSecretKey: string,
  session: Record<string, unknown>,
) {
  if (session.mode !== "subscription") return;

  const userId = (session.metadata as Record<string, string>)?.user_id;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  if (!userId || !subscriptionId) {
    throw new Error("Missing user_id or subscription in checkout session");
  }

  // Upsert stripe_customers
  await supabase.from("stripe_customers").upsert(
    { user_id: userId, stripe_customer_id: customerId },
    { onConflict: "user_id" },
  );

  // Fetch subscription details from Stripe
  const subRes = await fetch(
    `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!subRes.ok) {
    throw new Error(`Failed to fetch subscription: ${await subRes.text()}`);
  }

  const sub = await subRes.json();

  // Upsert subscription
  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: sub.items.data[0]?.price?.id ?? "",
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      canceled_at: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  // Update profile tier
  await supabase
    .from("profiles")
    .update({ subscription_tier: tierFromStatus(sub.status) })
    .eq("id", userId);

  // Send welcome email — fire-and-forget, failure logged but won't delay webhook response
  void (async () => {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      if (user?.email) {
        await sendWelcomeEmail(user.email, user.user_metadata?.display_name ?? null);
      }
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }
  })();
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  sub: Record<string, unknown>,
) {
  // CRITICAL fix #4: fallback to DB lookup if metadata missing
  const userId = await resolveUserId(
    supabase,
    sub.metadata as Record<string, string> | undefined,
    sub.id as string,
  );
  if (!userId) {
    console.error("Cannot resolve user_id for subscription", sub.id);
    return;
  }

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_subscription_id: sub.id as string,
      stripe_price_id:
        ((sub.items as Record<string, unknown>)?.data as Array<Record<string, unknown>>)?.[0]
          ?.price
          ? (((sub.items as Record<string, unknown>).data as Array<Record<string, unknown>>)[0]
              .price as Record<string, string>).id
          : "",
      status: sub.status as string,
      current_period_start: new Date(
        (sub.current_period_start as number) * 1000,
      ).toISOString(),
      current_period_end: new Date(
        (sub.current_period_end as number) * 1000,
      ).toISOString(),
      cancel_at_period_end: (sub.cancel_at_period_end as boolean) ?? false,
      canceled_at: sub.canceled_at
        ? new Date((sub.canceled_at as number) * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );

  await supabase
    .from("profiles")
    .update({ subscription_tier: tierFromStatus(sub.status as string) })
    .eq("id", userId);
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createClient>,
  sub: Record<string, unknown>,
) {
  // CRITICAL fix #4: fallback to DB lookup if metadata missing
  const userId = await resolveUserId(
    supabase,
    sub.metadata as Record<string, string> | undefined,
    sub.id as string,
  );
  if (!userId) {
    console.error("Cannot resolve user_id for subscription", sub.id);
    return;
  }

  await supabase
    .from("subscriptions")
    .update({
      status: (sub.status as string) || "canceled",
      canceled_at: sub.canceled_at
        ? new Date((sub.canceled_at as number) * 1000).toISOString()
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", sub.id as string);

  await supabase
    .from("profiles")
    .update({ subscription_tier: "free" })
    .eq("id", userId);
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createClient>,
  invoice: Record<string, unknown>,
) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  await supabase
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);

  // Downgrade profile tier — past_due should not grant premium access
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (sub?.user_id) {
    await supabase
      .from("profiles")
      .update({ subscription_tier: "free" })
      .eq("id", sub.user_id);
  }
}

async function handlePaymentSucceeded(
  supabase: ReturnType<typeof createClient>,
  invoice: Record<string, unknown>,
) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // If it was past_due, restore to active
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("user_id, status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (sub && ["past_due", "unpaid", "incomplete"].includes(sub.status)) {
    await supabase
      .from("subscriptions")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscriptionId);

    await supabase
      .from("profiles")
      .update({ subscription_tier: "premium" })
      .eq("id", sub.user_id);
  }
}

async function sendWelcomeEmail(email: string, displayName: string | null) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured, skipping welcome email");
    return;
  }

  const rawName = (displayName || "sportif").replace(/[\r\n\t]/g, "").slice(0, 50);
  const name = rawName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const subjectName = rawName;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="background:#0f0f17;padding:32px 40px;text-align:center;">
        <img src="https://www.wan2fit.fr/logo-wan2fit.png" alt="Wan2Fit" width="48" height="48" style="display:inline-block;vertical-align:middle;">
        <span style="color:#ffffff;font-size:24px;font-weight:800;margin-left:12px;vertical-align:middle;">Wan2Fit</span>
      </td>
    </tr>
    <tr>
      <td style="padding:40px 40px 24px;">
        <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a2e;">Salut ${name} !</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444;">
          Merci de ta confiance. Ton abonnement Wan2Fit est actif — tu as maintenant accès à tout ce qu'il faut pour progresser à ton rythme.
        </p>
        <h2 style="margin:0 0 12px;font-size:16px;color:#1a1a2e;">Ce qui t'attend :</h2>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">🎯</td>
            <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#444;">
              <strong style="color:#1a1a2e;">Séances sur mesure</strong><br>L'IA crée ta séance selon tes envies et ton niveau.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">📋</td>
            <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#444;">
              <strong style="color:#1a1a2e;">Programmes personnalisés</strong><br>Un plan multi-semaines adapté à tes objectifs, avec progression intégrée.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;font-size:20px;">📈</td>
            <td style="padding:8px 0;font-size:14px;line-height:1.5;color:#444;">
              <strong style="color:#1a1a2e;">Suivi de progression</strong><br>Chaque séance est enregistrée. Suis tes stats semaine après semaine.
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#444;">
          Un conseil : commence par <strong>créer ton premier programme</strong>. C'est le meilleur moyen de rester régulier.
        </p>
        <a href="https://www.wan2fit.fr/programme/creer" style="display:inline-block;padding:14px 32px;background:#6366f1;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;">
          Créer mon programme →
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 32px;border-top:1px solid #eee;">
        <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.5;">
          Une question ou suggestion ? <a href="mailto:contact@wan2fit.fr" style="color:#6366f1;text-decoration:none;">contact@wan2fit.fr</a>
        </p>
        <p style="margin:0;font-size:13px;color:#888;">
          À très vite sur le tapis,<br>L'équipe Wan2Fit 💪
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Wan2Fit <noreply@wan2fit.fr>",
      to: email,
      subject: `Bienvenue ${subjectName} ! Ton accès complet Wan2Fit est prêt`,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "Unknown");
    console.error("Resend API error:", res.status, errText);
  }
}
