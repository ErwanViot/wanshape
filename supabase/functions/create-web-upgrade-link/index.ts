// Generate a one-shot magic link that lands the user on /upgrade?priceId=...
// already authenticated. Used by the native iOS/Android app to bounce a
// user out of an in-app paywall and into the web checkout (Apple guideline
// 3.1.3(b) Multiplatform Service: an account-based service can let the
// user upgrade outside the app, as long as no in-app purchase or pricing
// is shown). The mobile app calls this endpoint, opens the returned URL
// inside SafariViewController / Chrome Custom Tabs, and the user comes
// back after the Stripe round-trip.
//
// Body: { priceId: 'price_xxx' }
// Response: { url: 'https://wan2fit.fr/auth/v1/verify?...' }
//
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
// Required env (allow-list): STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getCorsHeaders, resolveAllowedOrigin } from '../_shared/cors.ts';

function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== 'POST') {
    return errorResponse(req, 'Method not allowed', 405);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(req, 'Missing authorization', 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return errorResponse(req, 'Server misconfigured', 500);
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user || !user.email) {
    return errorResponse(req, 'Non autorisé', 401);
  }

  let body: { priceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 'JSON invalide');
  }

  if (!body.priceId || typeof body.priceId !== 'string') {
    return errorResponse(req, 'priceId requis');
  }

  // Validate priceId against the same allow-list as create-checkout-session
  // so a malicious caller cannot redirect the user toward an unknown SKU.
  const allowedPrices = [
    Deno.env.get('STRIPE_PRICE_MONTHLY'),
    Deno.env.get('STRIPE_PRICE_YEARLY'),
  ].filter(Boolean);
  if (allowedPrices.length === 0 || !allowedPrices.includes(body.priceId)) {
    return errorResponse(req, 'Price non reconnu', 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const targetOrigin = resolveAllowedOrigin(req);
  const redirectTo = `${targetOrigin}/upgrade?priceId=${encodeURIComponent(body.priceId)}`;

  // generateLink with type 'magiclink' returns an action_link the user can
  // click to be auto-authenticated. The link is single-use and short-lived
  // (default 1h) — perfect for this hand-off.
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    console.error('generateLink failed:', error);
    return errorResponse(req, 'Magic link generation failed', 500);
  }

  return jsonResponse(req, { url: data.properties.action_link });
});
