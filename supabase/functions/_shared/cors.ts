/**
 * Shared CORS helpers for all edge functions.
 *
 * Until 2026-04, the same six lines of origin whitelist + `getCorsHeaders`
 * were duplicated across every edge function. Adding a preview domain or
 * tightening an allowed origin meant six coordinated edits — an accident
 * waiting to happen. This module is the single source of truth.
 *
 * Deno edge functions cannot import from `src/`, so this file intentionally
 * lives under `supabase/functions/_shared/` which IS reachable from every
 * edge function via a relative import: `import { ... } from "../_shared/cors.ts";`
 */

export const PROD_ORIGINS = [
  'https://wan2fit.fr',
  'https://www.wan2fit.fr',
] as const;

export const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'] as const;

export const DEFAULT_ORIGIN = 'https://wan2fit.fr';

/**
 * Returns the list of origins the edge functions should accept CORS requests
 * from. In production, only the live domains are allowed; in any other
 * environment the local dev servers are added.
 *
 * `environment` can be injected for deterministic tests; it defaults to the
 * `ENVIRONMENT` Deno env variable. The check is loose on purpose: anything
 * other than the exact string "production" falls back to the dev-friendly
 * list.
 */
export function getAllowedOrigins(environment?: string | null): readonly string[] {
  if (environment === 'production') return PROD_ORIGINS;
  return [...PROD_ORIGINS, ...DEV_ORIGINS];
}

export interface CorsHeaderOptions {
  /**
   * Extra request headers to advertise in `Access-Control-Allow-Headers`
   * beyond the default set. The Stripe webhook needs `stripe-signature`;
   * other functions leave this unset.
   */
  extraAllowedHeaders?: readonly string[];
  /**
   * Override the environment check (tests, branches). When omitted we read
   * `Deno.env.get("ENVIRONMENT")`.
   */
  environment?: string | null;
}

const BASE_ALLOWED_HEADERS = ['authorization', 'x-client-info', 'apikey', 'content-type'];
const ALLOWED_METHODS = 'POST, OPTIONS';

/**
 * Builds the CORS response headers for an edge function. Accepts a `Request`
 * so we can reflect the incoming `Origin` if it is on the whitelist (so
 * browsers see their exact origin in `Access-Control-Allow-Origin`, which is
 * required when the server also sets `Access-Control-Allow-Credentials`).
 *
 * Origins outside the whitelist fall back to the canonical production domain
 * — this keeps the response valid without leaking arbitrary origins.
 */
export function getCorsHeaders(req: Request, options: CorsHeaderOptions = {}): Record<string, string> {
  const environment = options.environment ?? safeReadEnv('ENVIRONMENT');
  const allowed = getAllowedOrigins(environment);
  const origin = req.headers.get('origin') ?? '';
  const allowedOrigin = allowed.includes(origin) ? origin : DEFAULT_ORIGIN;

  const headerList = options.extraAllowedHeaders
    ? [...BASE_ALLOWED_HEADERS, ...options.extraAllowedHeaders]
    : BASE_ALLOWED_HEADERS;

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': headerList.join(', '),
    'Access-Control-Allow-Methods': ALLOWED_METHODS,
  };
}

/**
 * Returns the resolved allowed origin for a request — used by Stripe flows
 * that need to construct success/cancel URLs using the caller's origin.
 */
export function resolveAllowedOrigin(req: Request, environment?: string | null): string {
  const env = environment ?? safeReadEnv('ENVIRONMENT');
  const allowed = getAllowedOrigins(env);
  const origin = req.headers.get('origin') ?? '';
  return allowed.includes(origin) ? origin : DEFAULT_ORIGIN;
}

function safeReadEnv(key: string): string | null {
  try {
    // `Deno` is undefined in Vitest (Node). Tests pass `environment` explicitly.
    // @ts-ignore - Deno global provided at runtime
    return typeof Deno !== 'undefined' ? (Deno.env.get(key) ?? null) : null;
  } catch {
    return null;
  }
}
