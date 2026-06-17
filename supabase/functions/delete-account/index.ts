// Permanent account deletion. Required for App Store compliance — Apple
// guideline 5.1.1(v) demands an in-app option to delete the account, not
// just deactivate. The function:
//   1. Verifies the caller's JWT.
//   2. If a Stripe subscription is active, cancels it immediately so we
//      stop billing the user we are about to remove. Skipped if no active
//      sub or if the sub is already canceled.
//   3. Deletes the auth user via auth.admin.deleteUser. Every domain table
//      (profiles, subscriptions, sessions, programs, custom sessions,
//      nutrition, recipes, …) cascades on auth.users.id, so a single
//      delete unwinds the whole graph.
//
// Body: none. Response: { ok: true } or { error: string }.
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY,
// STRIPE_SECRET_KEY (only used when a subscription needs to be canceled).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

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

  if (authError || !user) {
    return errorResponse(req, 'Non autorisé', 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Cancel the user's active Stripe subscription before we lose the
  // mapping. We only cancel if the local row is active/trialing/past_due —
  // canceled or incomplete subs are no-ops.
  const { data: activeSub } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeSub?.stripe_subscription_id) {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return errorResponse(req, 'STRIPE_SECRET_KEY not configured', 500);
    }
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/subscriptions/${activeSub.stripe_subscription_id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
        signal: AbortSignal.timeout(10_000),
      },
    );
    // We tolerate 404 (already deleted on Stripe side) but bail on real
    // errors — better to keep the account and let the user retry than to
    // delete the auth row while billing keeps running.
    if (!stripeRes.ok && stripeRes.status !== 404) {
      console.error('Stripe cancel failed:', stripeRes.status, await stripeRes.text());
      return errorResponse(req, 'Échec annulation Stripe — réessayez', 500);
    }
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('auth.admin.deleteUser failed:', deleteError);
    return errorResponse(req, 'Suppression du compte échouée', 500);
  }

  return jsonResponse(req, { ok: true });
});
