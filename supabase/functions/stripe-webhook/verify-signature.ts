/**
 * Manual Stripe webhook signature verification using `crypto.subtle`.
 *
 * Re-implemented here (instead of pulling the Stripe SDK into the edge
 * function) because:
 * 1. The SDK verifier is Node-only and the edge runtime is Deno.
 * 2. The verifier is ~30 lines — small enough to own, audit and unit-test
 *    directly.
 *
 * The returned function is pure (modulo the Date.now() timestamp window) so
 * unit tests run entirely offline.
 *
 * Reference: https://docs.stripe.com/webhooks#verify-manually
 */

/**
 * Constant-time comparison of two hex signatures.
 * Equal-length inputs: XOR each byte. Different-length: XOR the length
 * mismatch too so the accumulator stays non-zero. Never early-exits.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let result = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return result === 0;
}

export const DEFAULT_TOLERANCE_SECONDS = 300;

/**
 * Verifies the `Stripe-Signature` header against the raw request body using
 * the shared webhook secret. Returns `true` only when the header parses, the
 * timestamp is within `toleranceSeconds`, and at least one of the `v1=...`
 * signatures matches the HMAC-SHA256 we compute locally.
 *
 * `nowSeconds` is injected so tests can freeze time deterministically.
 */
export async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  options: { toleranceSeconds?: number; nowSeconds?: number } = {},
): Promise<boolean> {
  const toleranceSeconds = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;

  const parts = sigHeader.split(',').reduce(
    (acc, part) => {
      const [key, value] = part.split('=');
      if (key === 't') acc.timestamp = value;
      if (key === 'v1' && value) acc.signatures.push(value);
      return acc;
    },
    { timestamp: '', signatures: [] as string[] },
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  const parsedTimestamp = Number.parseInt(parts.timestamp, 10);
  if (!Number.isFinite(parsedTimestamp)) return false;

  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsedTimestamp) > toleranceSeconds) return false;

  const signedPayload = `${parts.timestamp}.${payload}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));

  const expectedSig = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return parts.signatures.some((sig) => timingSafeEqual(sig, expectedSig));
}
