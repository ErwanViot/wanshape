import { describe, expect, it } from 'vitest';
import { DEFAULT_ORIGIN, getAllowedOrigins, getCorsHeaders, resolveAllowedOrigin } from './cors.ts';

function requestWithOrigin(origin?: string): Request {
  const headers = origin !== undefined ? { origin } : {};
  return new Request('https://edge.example/', { headers });
}

describe('getAllowedOrigins', () => {
  it('returns the production domains AND the Capacitor WebView origins when ENVIRONMENT is "production"', () => {
    const origins = getAllowedOrigins('production');
    expect(origins).toEqual([
      'https://wan2fit.fr',
      'https://www.wan2fit.fr',
      'https://localhost',
      'capacitor://localhost',
    ]);
  });

  it('includes dev origins AND native app origins for any other environment', () => {
    const origins = getAllowedOrigins('preview');
    expect(origins).toContain('http://localhost:5173');
    expect(origins).toContain('http://localhost:4173');
    expect(origins).toContain('https://localhost');
    expect(origins).toContain('capacitor://localhost');
  });

  it('includes dev origins when environment is null/undefined', () => {
    expect(getAllowedOrigins(null)).toContain('http://localhost:5173');
    expect(getAllowedOrigins(undefined)).toContain('http://localhost:5173');
  });

  it('always includes the Capacitor WebView origins regardless of environment', () => {
    for (const env of ['production', 'preview', null, undefined]) {
      const origins = getAllowedOrigins(env);
      expect(origins).toContain('https://localhost');
      expect(origins).toContain('capacitor://localhost');
    }
  });
});

describe('getCorsHeaders', () => {
  it('reflects a whitelisted prod origin verbatim', () => {
    const req = requestWithOrigin('https://wan2fit.fr');
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe('https://wan2fit.fr');
  });

  it('reflects a whitelisted dev origin in non-prod', () => {
    const req = requestWithOrigin('http://localhost:5173');
    const headers = getCorsHeaders(req, { environment: 'preview' });
    expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
  });

  it('falls back to the default origin for an unknown caller', () => {
    const req = requestWithOrigin('https://attacker.example');
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe(DEFAULT_ORIGIN);
  });

  it('falls back to the default origin when origin header is missing', () => {
    const req = requestWithOrigin();
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe(DEFAULT_ORIGIN);
  });

  it('does NOT reflect dev origins in production', () => {
    const req = requestWithOrigin('http://localhost:5173');
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe(DEFAULT_ORIGIN);
  });

  it('reflects the Android Capacitor origin (https://localhost) in production', () => {
    const req = requestWithOrigin('https://localhost');
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe('https://localhost');
  });

  it('reflects the iOS Capacitor origin (capacitor://localhost) in production', () => {
    const req = requestWithOrigin('capacitor://localhost');
    const headers = getCorsHeaders(req, { environment: 'production' });
    expect(headers['Access-Control-Allow-Origin']).toBe('capacitor://localhost');
  });

  it('always advertises POST and OPTIONS', () => {
    const headers = getCorsHeaders(requestWithOrigin(), { environment: 'preview' });
    expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
  });

  it('exposes the base allowed headers by default', () => {
    const headers = getCorsHeaders(requestWithOrigin(), { environment: 'preview' });
    const allow = headers['Access-Control-Allow-Headers'];
    expect(allow).toContain('authorization');
    expect(allow).toContain('x-client-info');
    expect(allow).toContain('apikey');
    expect(allow).toContain('content-type');
  });

  it('appends extra allowed headers (e.g. stripe-signature) with an exact header string', () => {
    const headers = getCorsHeaders(requestWithOrigin('https://wan2fit.fr'), {
      environment: 'production',
      extraAllowedHeaders: ['stripe-signature'],
    });
    expect(headers['Access-Control-Allow-Headers']).toBe(
      'authorization, x-client-info, apikey, content-type, stripe-signature',
    );
  });

  it('matches the stripe-webhook wrapper contract (synthetic Request construction)', () => {
    // Mirrors the local wrapper in supabase/functions/stripe-webhook/index.ts:
    // the wrapper constructs a synthetic Request from an optional origin and
    // delegates here. Make sure both branches (origin defined / undefined)
    // behave exactly as the wrapper expects.
    const buildReq = (origin?: string) =>
      new Request('https://edge.example/', {
        headers: origin ? { origin } : undefined,
      });

    const whitelisted = getCorsHeaders(buildReq('http://localhost:5173'), {
      environment: 'preview',
      extraAllowedHeaders: ['stripe-signature'],
    });
    expect(whitelisted['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
    expect(whitelisted['Access-Control-Allow-Headers']).toContain('stripe-signature');

    const noOrigin = getCorsHeaders(buildReq(), {
      environment: 'production',
      extraAllowedHeaders: ['stripe-signature'],
    });
    expect(noOrigin['Access-Control-Allow-Origin']).toBe(DEFAULT_ORIGIN);
    expect(noOrigin['Access-Control-Allow-Headers']).toContain('stripe-signature');
  });
});

describe('resolveAllowedOrigin', () => {
  it('returns the verbatim origin when whitelisted', () => {
    const req = requestWithOrigin('https://www.wan2fit.fr');
    expect(resolveAllowedOrigin(req, 'production')).toBe('https://www.wan2fit.fr');
  });

  it('returns DEFAULT_ORIGIN when not whitelisted', () => {
    const req = requestWithOrigin('https://unknown.example');
    expect(resolveAllowedOrigin(req, 'production')).toBe(DEFAULT_ORIGIN);
  });

  it('returns DEFAULT_ORIGIN when origin header is missing', () => {
    expect(resolveAllowedOrigin(requestWithOrigin(), 'production')).toBe(DEFAULT_ORIGIN);
  });

  it('returns DEFAULT_ORIGIN (NOT https://localhost) for the Android Capacitor origin', () => {
    // Capacitor WebView origins are valid for CORS but invalid as redirect
    // targets — those URLs only exist inside the app's WebView.
    const req = requestWithOrigin('https://localhost');
    expect(resolveAllowedOrigin(req, 'production')).toBe(DEFAULT_ORIGIN);
  });

  it('returns DEFAULT_ORIGIN (NOT capacitor://localhost) for the iOS Capacitor origin', () => {
    const req = requestWithOrigin('capacitor://localhost');
    expect(resolveAllowedOrigin(req, 'production')).toBe(DEFAULT_ORIGIN);
  });
});
