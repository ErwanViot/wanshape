import { supabase } from './supabase.ts';

/** Error codes / messages that indicate a stale or expired auth session. */
const AUTH_ERROR_INDICATORS = [
  'JWT expired',
  'JWTExpired',
  'PGRST301', // PostgREST unauthorized
  '42501', // PostgreSQL insufficient_privilege (RLS denial)
  'permission denied',
  'Invalid Refresh Token',
  'Refresh Token Not Found',
  'Auth session missing',
  'not_authenticated',
];

function isAuthError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const haystack = `${error.message ?? ''} ${error.code ?? ''}`.toLowerCase();
  return AUTH_ERROR_INDICATORS.some((indicator) => haystack.includes(indicator.toLowerCase()));
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt to refresh the session once (deduped across concurrent callers). */
async function tryRefreshSession(): Promise<boolean> {
  if (!supabase) return false;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Gate that blocks queries while a visibility-triggered refresh is in progress.
 * This prevents queries from firing with a stale token when returning to the tab.
 */
let visibilityRefreshPromise: Promise<void> | null = null;

export function setVisibilityRefreshPromise(p: Promise<void> | null) {
  visibilityRefreshPromise = p;
}

/**
 * Execute a Supabase query with automatic session recovery.
 *
 * Before executing, ensures the token is fresh (waits for any pending
 * visibility refresh and checks token expiry). If the query still fails
 * with an auth error, retries once after a forced refresh.
 */
export async function supabaseQuery<T>(
  queryFn: () => PromiseLike<{ data: T; error: { message?: string; code?: string } | null }>,
): Promise<{ data: T | null; error: { message?: string; code?: string } | null; sessionExpired: boolean }> {
  // Wait for any ongoing visibility-triggered refresh before querying
  if (visibilityRefreshPromise) {
    await visibilityRefreshPromise;
  }

  const result = await queryFn();

  if (!isAuthError(result.error)) {
    return { data: result.data, error: result.error, sessionExpired: false };
  }

  // Auth error detected — try refreshing the session
  const refreshed = await tryRefreshSession();
  if (!refreshed) {
    return { data: null, error: result.error, sessionExpired: true };
  }

  // Retry the query once after successful refresh
  const retry = await queryFn();
  if (isAuthError(retry.error)) {
    return { data: null, error: retry.error, sessionExpired: true };
  }

  return { data: retry.data, error: retry.error, sessionExpired: false };
}

/**
 * Event target for session expiry notifications.
 * Components can subscribe to be notified when a query detects session expiry.
 */
export const sessionEvents = new EventTarget();

export function notifySessionExpired() {
  sessionEvents.dispatchEvent(new Event('session-expired'));
}
