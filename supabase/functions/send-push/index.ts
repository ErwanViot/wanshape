// Send a push notification to all devices of a single user via Firebase
// Cloud Messaging HTTP v1. Server-to-server only — guarded by an
// INTERNAL_PUSH_SECRET header so we don't accept requests from authenticated
// users (call sites: triggers DB, cron edge functions, internal admin
// scripts).
//
// Body: {
//   user_id: string,
//   title: string,
//   body: string,
//   category: 'info' | 'progression' | 'new_content',
//   data?: Record<string, string>
// }
// Response: { sent: number, removed: number }
//
// Required env:
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   - INTERNAL_PUSH_SECRET (shared secret for internal callers)
//   - FCM_SERVICE_ACCOUNT_JSON (Firebase Admin SDK service account JSON,
//     stringified — used to build a Google OAuth access token)
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

// Constant-time string compare. We can't reuse Node's
// `crypto.timingSafeEqual` (Deno edge runtime), so we XOR every byte
// pair and only look at the accumulated result at the end. Strings of
// different lengths short-circuit to false immediately, but the cost
// of length mismatch is negligible compared to the secret entropy.
function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');
  const binary = atob(cleaned);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

function base64UrlEncode(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  let str = '';
  for (let i = 0; i < bytes.length; i += 1) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getFcmAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const header = { alg: 'RS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const claimsB64 = base64UrlEncode(JSON.stringify(claims));
  const unsigned = `${headerB64}.${claimsB64}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!tokenRes.ok) {
    throw new Error(`OAuth token exchange failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const tokenJson = await tokenRes.json();
  return tokenJson.access_token as string;
}

async function sendFcmMessage(
  accessToken: string,
  projectId: string,
  payload: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  },
): Promise<{ status: number; bodyText: string }> {
  const message = {
    message: {
      token: payload.token,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
    },
  };
  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
    signal: AbortSignal.timeout(10_000),
  });
  return { status: res.status, bodyText: await res.text() };
}

const ALLOWED_CATEGORIES = ['info', 'progression', 'new_content'] as const;

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const internalSecret = Deno.env.get('INTERNAL_PUSH_SECRET');
  if (!internalSecret) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // Constant-time compare so an attacker with network access can't
  // bruteforce INTERNAL_PUSH_SECRET byte-by-byte via timing analysis
  // on the early-out behaviour of `!==` on string mismatch.
  const provided = req.headers.get('x-internal-secret') ?? '';
  if (!timingSafeEqualString(provided, internalSecret)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json().catch(() => null)) as {
    user_id?: string;
    title?: string;
    body?: string;
    category?: string;
    data?: Record<string, string>;
  } | null;
  if (!body?.user_id || !body.title || !body.body || !body.category) {
    return new Response(JSON.stringify({ error: 'Missing fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!ALLOWED_CATEGORIES.includes(body.category as (typeof ALLOWED_CATEGORIES)[number])) {
    return new Response(JSON.stringify({ error: 'Invalid category' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const fcmJson = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
  if (!supabaseUrl || !supabaseServiceKey || !fcmJson) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Honor the user's category opt-in. info defaults to true on signup;
  // progression and new_content default to false. We select the three
  // columns explicitly (instead of injecting body.category into the
  // select) so the query shape stays static even if a future caller
  // bypasses the ALLOWED_CATEGORIES check above.
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('info, progression, new_content')
    .eq('user_id', body.user_id)
    .maybeSingle<{ info: boolean; progression: boolean; new_content: boolean }>();
  const category = body.category as (typeof ALLOWED_CATEGORIES)[number];
  if (!prefs || prefs[category] !== true) {
    return new Response(JSON.stringify({ sent: 0, removed: 0, skipped: 'opt-out' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { data: devices } = await supabase
    .from('user_devices')
    .select('id, token')
    .eq('user_id', body.user_id);
  if (!devices || devices.length === 0) {
    return new Response(JSON.stringify({ sent: 0, removed: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(fcmJson) as ServiceAccount;
  } catch {
    return new Response(JSON.stringify({ error: 'FCM_SERVICE_ACCOUNT_JSON invalid' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let accessToken: string;
  try {
    accessToken = await getFcmAccessToken(serviceAccount);
  } catch (err) {
    console.error('FCM OAuth failed:', err);
    return new Response(JSON.stringify({ error: 'FCM auth failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fan out in parallel — same body to every device for the user.
  const results = await Promise.allSettled(
    devices.map((device) =>
      sendFcmMessage(accessToken, serviceAccount.project_id, {
        token: device.token,
        title: body.title!,
        body: body.body!,
        data: body.data,
      }).then((res) => ({ device, ...res })),
    ),
  );

  let sent = 0;
  const idsToRemove: string[] = [];
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('FCM send rejected:', result.reason);
      continue;
    }
    const { device, status, bodyText } = result.value;
    if (status >= 200 && status < 300) {
      sent += 1;
    } else if (status === 404 || status === 400) {
      // 404 = token unregistered, 400 = invalid token format. Both
      // permanent — drop the device row so the next send doesn't retry.
      idsToRemove.push(device.id);
      console.warn('FCM removing token:', status, bodyText);
    } else {
      console.error('FCM send failed:', status, bodyText);
    }
  }

  if (idsToRemove.length > 0) {
    await supabase.from('user_devices').delete().in('id', idsToRemove);
  }

  return new Response(JSON.stringify({ sent, removed: idsToRemove.length }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
