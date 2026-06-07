// RevenueCat webhook — receives native IAP events (iOS StoreKit, Android Play
// Billing) from RevenueCat and syncs `profiles.subscription_tier` +
// `subscription_provider` in Supabase. Companion to `stripe-webhook` which
// handles web Stripe checkout events. Both webhooks converge on the same
// source of truth: `profiles.subscription_tier`.
//
// Authentication: RevenueCat is configured to send an Authorization header
// "Bearer <REVENUECAT_WEBHOOK_SECRET>". We compare with a timing-safe check.
// The secret lives in Supabase Edge Functions Secrets (set via
// `supabase secrets set REVENUECAT_WEBHOOK_SECRET=… --project-ref …`).
//
// Event reference: https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
//
// Why a separate edge function (not one big webhook): Stripe and RevenueCat
// have completely different payload shapes, different signature schemes, and
// independent rotation cadences. Keeping them separate isolates blast radius
// — a bad RevenueCat payload can never break Stripe processing and vice
// versa.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// Subset of the RevenueCat event payload we care about. The full schema is
// large; we type only what we read so a schema addition upstream never
// breaks our handler.
interface RevenueCatEvent {
  type: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  environment?: "PRODUCTION" | "SANDBOX";
  expiration_at_ms?: number;
  store?: string;
}

interface RevenueCatPayload {
  event: RevenueCatEvent;
  api_version: string;
}

// Events that grant or maintain a premium entitlement. Anything not in this
// set transitions the user to free (cancellation, expiration, billing
// failure, refund).
//
// Note on PRODUCT_CHANGE: handled as "premium" — it covers monthly→yearly
// upgrades. The user stays premium throughout, only the product they pay
// for changes.
const PREMIUM_GRANTING_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION", // user reactivated after a previous cancellation
  "PRODUCT_CHANGE", // tier swap, e.g. monthly → yearly
  "TEMPORARY_ENTITLEMENT_GRANT", // RevenueCat customer support granted a grace
]);

const PREMIUM_REVOKING_EVENTS = new Set([
  "CANCELLATION", // user opted out — but stays premium until expiration_at_ms
  "EXPIRATION", // grace period over, access actually revoked
  "BILLING_ISSUE", // payment failed and grace exhausted
  "SUBSCRIPTION_PAUSED",
  "EXPIRED_FROM_BILLING_ISSUE",
]);

function jsonResponse(data: unknown, status = 200) {
  // Webhooks aren't browser-originated so CORS would normally be moot, but we
  // emit it anyway to stay consistent with the rest of the edge functions
  // (and to make local testing via curl from the dev server painless).
  const req = new Request("https://edge.example/");
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json",
    },
  });
}

// Timing-safe string comparison to defeat naive timing-attack probes on the
// secret. Same primitive used in `send-push` (`timingSafeEqualString`).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function classifyEvent(eventType: string): "premium" | "free" | "ignore" {
  if (PREMIUM_GRANTING_EVENTS.has(eventType)) return "premium";
  if (PREMIUM_REVOKING_EVENTS.has(eventType)) return "free";
  // Events we explicitly don't act on: TEST (RevenueCat dashboard test),
  // SUBSCRIBER_ALIAS (account linking, no tier change), NON_RENEWING_PURCHASE
  // (we don't sell those), TRANSFER (purchase moved between users — handled
  // by INITIAL_PURCHASE/EXPIRATION on the two affected users), etc.
  return "ignore";
}

Deno.serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Authenticate via Bearer secret. Required header format:
  //   Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>
  const authHeader = req.headers.get("authorization") ?? "";
  const expectedSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!expectedSecret) {
    console.error("REVENUECAT_WEBHOOK_SECRET not set in edge function secrets");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const expectedAuth = `Bearer ${expectedSecret}`;
  if (!timingSafeEqual(authHeader, expectedAuth)) {
    // Don't leak which part failed (header missing vs wrong value).
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // Parse payload
  let payload: RevenueCatPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const event = payload?.event;
  if (!event || typeof event.type !== "string") {
    return jsonResponse({ error: "Missing event.type" }, 400);
  }

  // RevenueCat sends app_user_id = whatever the client passed via
  // Purchases.configure({appUserID}). We bind it to our Supabase user.id.
  // original_app_user_id is the alias chain root (only differs after
  // SUBSCRIBER_ALIAS events, which we ignore anyway).
  const userId = event.app_user_id ?? event.original_app_user_id;
  if (!userId) {
    return jsonResponse({ error: "Missing app_user_id" }, 400);
  }

  const action = classifyEvent(event.type);
  if (action === "ignore") {
    // 200 OK so RevenueCat doesn't retry. Log so we can spot unhandled
    // event types in production logs.
    console.log(`[revenuecat-webhook] ignored event=${event.type} user=${userId}`);
    return jsonResponse({ ok: true, ignored: event.type });
  }

  // Service role client — needed because RLS on profiles forbids users from
  // editing their own subscription_tier (migration 011). Only this webhook
  // (and stripe-webhook) can mutate it.
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Idempotency: if the user is already in the target state, do nothing.
  // RevenueCat retries failed deliveries; without this short-circuit each
  // retry would trigger an unnecessary UPDATE (no harm but noisy in audit).
  const { data: current, error: readError } = await supabase
    .from("profiles")
    .select("subscription_tier, subscription_provider")
    .eq("id", userId)
    .single();

  if (readError) {
    // Most likely: user does not exist (e.g. someone with an Apple-ID-only
    // account trying to subscribe before completing Wan2Fit signup, or a
    // sandbox tester whose Supabase user was deleted). Log + 200 OK so
    // RevenueCat stops retrying — we can investigate in logs.
    console.warn(`[revenuecat-webhook] user not found id=${userId} event=${event.type}`);
    return jsonResponse({ ok: true, skipped: "user_not_found" });
  }

  if (current.subscription_tier === action && current.subscription_provider === "revenuecat") {
    console.log(`[revenuecat-webhook] idempotent event=${event.type} user=${userId} tier=${action}`);
    return jsonResponse({ ok: true, idempotent: true });
  }

  // Apply the change. We always set provider='revenuecat' on the UPDATE, even
  // when going to 'free' — that way we keep the historical attribution
  // (this user's last paid run was native, not web). When/if they re-subscribe
  // via Stripe later, stripe-webhook will overwrite the provider.
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      subscription_tier: action,
      subscription_provider: "revenuecat",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    console.error(`[revenuecat-webhook] UPDATE failed user=${userId}:`, updateError);
    // 500 so RevenueCat retries — transient DB issues do exist.
    return jsonResponse({ error: "DB update failed" }, 500);
  }

  console.log(
    `[revenuecat-webhook] applied event=${event.type} user=${userId} → ${action} (env=${event.environment ?? "unknown"})`,
  );

  return jsonResponse({ ok: true, applied: action });
});
