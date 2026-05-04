// Register or refresh a Firebase Cloud Messaging device token for the
// authenticated user. Called by usePushNotifications on every app launch
// after the user accepts the permission prompt — the token rotates over
// time so we always upsert.
//
// Body: { token: string, platform: 'ios' | 'android', device_label?: string }
// Response: { ok: true }
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

const ALLOWED_PLATFORMS = new Set(['ios', 'android']);

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

  let body: { token?: unknown; platform?: unknown; device_label?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(req, 'JSON invalide');
  }

  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const platform = typeof body.platform === 'string' ? body.platform : '';
  const deviceLabel = typeof body.device_label === 'string' ? body.device_label.slice(0, 80) : null;

  if (!token || token.length > 4096) {
    return errorResponse(req, 'token requis');
  }
  if (!ALLOWED_PLATFORMS.has(platform)) {
    return errorResponse(req, 'platform invalide');
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { error: upsertError } = await supabaseAdmin
    .from('user_devices')
    .upsert(
      {
        user_id: user.id,
        token,
        platform,
        device_label: deviceLabel,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'token' },
    );

  if (upsertError) {
    console.error('register-push-device upsert failed:', upsertError);
    return errorResponse(req, 'Enregistrement impossible', 500);
  }

  return jsonResponse(req, { ok: true });
});
