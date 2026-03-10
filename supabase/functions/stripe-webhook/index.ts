import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Constant-time comparison to prevent timing attacks (CRITICAL fix #1)
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i];
  }
  return result === 0;
}

// Verify Stripe webhook signature using crypto.subtle (Deno-compatible)
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key === "t") acc.timestamp = value;
      if (key === "v1") acc.signatures.push(value);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] },
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  // Check timestamp tolerance (5 minutes)
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(parts.timestamp, 10)) > tolerance) return false;

  const signedPayload = `${parts.timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload),
  );

  const expectedSig = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Use constant-time comparison (CRITICAL fix #1)
  return parts.signatures.some((sig) => timingSafeEqual(sig, expectedSig));
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
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!webhookSecret || !stripeSecretKey) {
    return errorResponse("Stripe secrets not configured", 500);
  }

  const sigHeader = req.headers.get("stripe-signature");
  if (!sigHeader) {
    return errorResponse("Missing stripe-signature header", 400);
  }

  const body = await req.text();

  // Verify signature
  const isValid = await verifyStripeSignature(body, sigHeader, webhookSecret);
  if (!isValid) {
    return errorResponse("Invalid signature", 401);
  }

  // Safe JSON parse (MINOR fix #13)
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return errorResponse("Invalid JSON body", 400);
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
    return jsonResponse({ received: true, duplicate: true });
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
    return errorResponse("Webhook processing error", 500);
  }

  return jsonResponse({ received: true });
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
    console.error("Missing user_id or subscription in checkout session");
    return;
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
    },
  );

  if (!subRes.ok) {
    console.error("Failed to fetch subscription:", await subRes.text());
    return;
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
      status: "canceled",
      canceled_at: new Date().toISOString(),
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

  if (sub && sub.status === "past_due") {
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
