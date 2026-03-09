import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  // Auth
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing authorization", 401);
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) {
    return errorResponse("STRIPE_SECRET_KEY not configured", 500);
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
    return errorResponse("Non autorisé", 401);
  }

  // Parse body
  let body: { priceId: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("JSON invalide");
  }

  if (!body.priceId || typeof body.priceId !== "string") {
    return errorResponse("priceId requis");
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
    return errorResponse("Vous avez déjà un abonnement actif", 400);
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
      return errorResponse("Erreur création client Stripe", 500);
    }

    const customer = await customerRes.json();
    stripeCustomerId = customer.id;

    // Save mapping
    const { error: insertError } = await supabaseAdmin
      .from("stripe_customers")
      .insert({ user_id: user.id, stripe_customer_id: stripeCustomerId });

    if (insertError) {
      console.error("Insert stripe_customers error:", insertError);
      return errorResponse("Erreur serveur", 500);
    }
  }

  // Determine origin for redirect URLs
  const origin = req.headers.get("origin") || "https://wanshape.com";

  // Create Checkout Session
  const params = new URLSearchParams({
    "mode": "subscription",
    "customer": stripeCustomerId,
    "line_items[0][price]": body.priceId,
    "line_items[0][quantity]": "1",
    "allow_promotion_codes": "true",
    "billing_address_collection": "auto",
    "tax_id_collection[enabled]": "true",
    "consent_collection[terms_of_service]": "required",
    "metadata[user_id]": user.id,
    "subscription_data[metadata][user_id]": user.id,
    "success_url": `${origin}/parametres?checkout=success`,
    "cancel_url": `${origin}/tarifs`,
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
    return errorResponse("Erreur création session de paiement", 500);
  }

  const session = await sessionRes.json();

  return jsonResponse({ url: session.url });
});
