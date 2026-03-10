import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://wan-shape.fr",
  "https://www.wan-shape.fr",
  "https://wan2fit.fr",
  "https://www.wan2fit.fr",
  "http://localhost:5173",
  "http://localhost:4173",
];

const DEFAULT_ORIGIN = "https://wan2fit.fr";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

function getValidOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return errorResponse(req, "Method not allowed", 405);
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse(req, "Missing authorization", 401);
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return errorResponse(req, "STRIPE_SECRET_KEY not configured", 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user JWT
  const supabaseAuth = createClient(
    supabaseUrl,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return errorResponse(req, "Non autorisé", 401);
  }

  // Parse body
  let body: { priceId: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, "JSON invalide");
  }

  if (!body.priceId || typeof body.priceId !== "string") {
    return errorResponse(req, "priceId requis");
  }

  // Validate priceId against allowlist — fail-closed if env vars not set
  const allowedPrices = [
    Deno.env.get("STRIPE_PRICE_MONTHLY"),
    Deno.env.get("STRIPE_PRICE_YEARLY"),
  ].filter(Boolean);

  if (allowedPrices.length === 0 || !allowedPrices.includes(body.priceId)) {
    return errorResponse(req, "Price non reconnu", 400);
  }

  // Check no active subscription exists
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .limit(1)
    .maybeSingle();

  if (existingSub) {
    return errorResponse(req, "Vous avez déjà un abonnement actif", 400);
  }

  // Get or create Stripe customer
  let stripeCustomerId: string;

  const { data: existingCustomer } = await supabaseAdmin
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingCustomer) {
    stripeCustomerId = existingCustomer.stripe_customer_id;
  } else {
    // Create Stripe customer
    const customerRes = await fetch("https://api.stripe.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        email: user.email ?? "",
        "metadata[user_id]": user.id,
      }),
    });

    if (!customerRes.ok) {
      console.error("Stripe customer creation failed:", await customerRes.text());
      return errorResponse(req, "Erreur création client Stripe", 500);
    }

    const customer = await customerRes.json();
    stripeCustomerId = customer.id;

    // Save mapping
    const { error: insertError } = await supabaseAdmin
      .from("stripe_customers")
      .insert({ user_id: user.id, stripe_customer_id: stripeCustomerId });

    if (insertError) {
      console.error("Insert stripe_customers error:", insertError);
      return errorResponse(req, "Erreur serveur", 500);
    }
  }

  // Validate origin for redirect URLs
  const origin = getValidOrigin(req);

  // Create Checkout Session
  const params = new URLSearchParams({
    "mode": "subscription",
    "customer": stripeCustomerId,
    "line_items[0][price]": body.priceId,
    "line_items[0][quantity]": "1",
    "allow_promotion_codes": "true",
    "billing_address_collection": "auto",
    "metadata[user_id]": user.id,
    "subscription_data[metadata][user_id]": user.id,
    "success_url": `${origin}/parametres?checkout=success`,
    "cancel_url": `${origin}/tarifs`,
    "locale": "fr",
  });

  const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!sessionRes.ok) {
    const errText = await sessionRes.text();
    console.error("Stripe checkout session error:", errText);
    return errorResponse(req, "Erreur création session de paiement", 500);
  }

  const session = await sessionRes.json();

  return jsonResponse(req, { url: session.url });
});
