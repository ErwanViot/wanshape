import { describe, expect, it } from 'vitest';
import { DEFAULT_TOLERANCE_SECONDS, timingSafeEqual, verifyStripeSignature } from './verify-signature.ts';

const SECRET = 'whsec_test_secret';
const FIXED_NOW = 1_700_000_000;

/**
 * Produce a valid `Stripe-Signature` header for a given payload + timestamp.
 * Mirrors what Stripe sends in production:
 *   `t=<unix>,v1=<hex-hmac-sha256>`
 */
async function signPayload(payload: string, timestamp: number, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
  const hex = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `t=${timestamp},v1=${hex}`;
}

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('', '')).toBe(true);
  });

  it('returns false for different content of the same length', () => {
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
  });

  it('returns false for different lengths', () => {
    // The "constant-time" property is not observable from a JS unit test
    // (no reliable timing primitive); here we only assert correctness.
    // The non-short-circuit property is audited in the source.
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
    expect(timingSafeEqual('abc', '')).toBe(false);
  });

  it('handles unicode correctly (byte-level compare)', () => {
    expect(timingSafeEqual('pomme', 'pomme')).toBe(true);
    expect(timingSafeEqual('café', 'café')).toBe(true);
    expect(timingSafeEqual('café', 'cafe')).toBe(false); // é is 2 bytes vs e is 1
  });
});

describe('verifyStripeSignature', () => {
  it('returns true for a freshly signed payload', async () => {
    const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
    const sigHeader = await signPayload(payload, FIXED_NOW, SECRET);
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(true);
  });

  it('returns false when the payload is tampered with', async () => {
    const original = '{"id":"evt_1","amount":100}';
    const sigHeader = await signPayload(original, FIXED_NOW, SECRET);
    const tampered = '{"id":"evt_1","amount":999}';
    const ok = await verifyStripeSignature(tampered, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false when the secret differs', async () => {
    const payload = '{"ok":true}';
    const sigHeader = await signPayload(payload, FIXED_NOW, SECRET);
    const ok = await verifyStripeSignature(payload, sigHeader, 'whsec_other', { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false when v1 is missing', async () => {
    const payload = '{}';
    const sigHeader = `t=${FIXED_NOW}`;
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false when v1 is present but empty', async () => {
    const payload = '{}';
    const sigHeader = `t=${FIXED_NOW},v1=`;
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false when t is missing', async () => {
    const payload = '{}';
    const sigHeader = 'v1=deadbeef';
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false when t is not a finite number', async () => {
    const payload = '{}';
    const sigHeader = 't=notanumber,v1=deadbeef';
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('returns false for an empty sigHeader', async () => {
    const ok = await verifyStripeSignature('{}', '', SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('rejects timestamps older than the tolerance window', async () => {
    const payload = '{}';
    const oldTs = FIXED_NOW - DEFAULT_TOLERANCE_SECONDS - 1;
    const sigHeader = await signPayload(payload, oldTs, SECRET);
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('rejects timestamps further in the future than the tolerance', async () => {
    const payload = '{}';
    const futureTs = FIXED_NOW + DEFAULT_TOLERANCE_SECONDS + 1;
    const sigHeader = await signPayload(payload, futureTs, SECRET);
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('accepts timestamps exactly at the tolerance boundary', async () => {
    const payload = '{}';
    const edgeTs = FIXED_NOW - DEFAULT_TOLERANCE_SECONDS;
    const sigHeader = await signPayload(payload, edgeTs, SECRET);
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(true);
  });

  it('accepts when at least one of several v1 signatures matches', async () => {
    const payload = '{"id":"evt"}';
    const real = await signPayload(payload, FIXED_NOW, SECRET);
    // Extract hex from the real signature, add a fake one before
    const hex = real.split(',v1=')[1];
    const sigHeader = `t=${FIXED_NOW},v1=deadbeef,v1=${hex}`;
    const ok = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(true);
  });

  it('returns false when none of several v1 signatures match', async () => {
    const sigHeader = `t=${FIXED_NOW},v1=deadbeef,v1=cafed00d`;
    const ok = await verifyStripeSignature('{}', sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(ok).toBe(false);
  });

  it('honors a custom toleranceSeconds', async () => {
    const payload = '{}';
    const oldTs = FIXED_NOW - 60;
    const sigHeader = await signPayload(payload, oldTs, SECRET);

    // Default tolerance (300s) — accept
    const acceptedDefault = await verifyStripeSignature(payload, sigHeader, SECRET, { nowSeconds: FIXED_NOW });
    expect(acceptedDefault).toBe(true);

    // Tight tolerance (30s) — reject
    const rejectedTight = await verifyStripeSignature(payload, sigHeader, SECRET, {
      nowSeconds: FIXED_NOW,
      toleranceSeconds: 30,
    });
    expect(rejectedTight).toBe(false);
  });
});
