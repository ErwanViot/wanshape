import type { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import i18n from '../i18n';
import { captureEvent, identifyUser, resetAnalytics } from '../lib/analytics.ts';
import { getAuthRedirectUrl } from '../lib/auth-redirects.ts';
import { captureException } from '../lib/sentryReport.ts';
import { supabase } from '../lib/supabase.ts';
import { sessionEvents } from '../lib/supabaseQuery.ts';
import type { Profile } from '../types/auth.ts';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  sessionExpired: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Map Supabase auth error messages (always EN) to i18n keys under `auth:supabase_errors.*`.
 * Resolved with the current locale via the `i18n` instance — this runs outside
 * React (signIn/signUp callbacks), hence the direct module import instead of `useTranslation`.
 */
// Primary match: GoTrue's stable `error.code` (supabase-js v2 surfaces it on
// AuthApiError). Codes don't drift across GoTrue releases the way the
// human-readable `message` does — matching the code first is what makes
// "email déjà utilisé" reliably reach the user instead of the generic
// fallback. See https://supabase.com/docs/reference/javascript/auth-error-codes
const SUPABASE_CODE_KEYS: Record<string, string> = {
  user_already_exists: 'user_already_registered',
  email_exists: 'user_already_registered',
  invalid_credentials: 'invalid_credentials',
  email_not_confirmed: 'email_not_confirmed',
  weak_password: 'password_too_short',
  email_address_invalid: 'invalid_email_format',
  validation_failed: 'invalid_email_format',
  over_email_send_rate_limit: 'email_rate_limited',
  over_request_rate_limit: 'rate_limited_short',
  same_password: 'new_password_same',
  session_not_found: 'session_missing',
};

// Fallback match: substring on the human-readable message, for GoTrue
// responses that don't carry a code (older deployments, edge cases).
const SUPABASE_ERROR_KEYS: Record<string, string> = {
  'Invalid login credentials': 'invalid_credentials',
  'Email not confirmed': 'email_not_confirmed',
  'User already registered': 'user_already_registered',
  'already been registered': 'user_already_registered',
  'already registered': 'user_already_registered',
  'already in use': 'user_already_registered',
  // Generic prefix that matches GoTrue's "Password should be at least N
  // characters" regardless of N. The client-side isPasswordStrong() catches
  // weak passwords first; this needle only fires if Supabase Cloud config
  // ever drifts below the local 8-char rule.
  'Password should be at least': 'password_too_short',
  'For security purposes, you can only request this after': 'rate_limited_short',
  'Unable to validate email address: invalid format': 'invalid_email_format',
  'New password should be different from the old password': 'new_password_same',
  'Auth session missing': 'session_missing',
  'Email rate limit exceeded': 'email_rate_limited',
};

type SupabaseAuthError = { message?: string; code?: string } | null | undefined;

// Map a Supabase auth error to a localized, user-facing message. Returns null
// when there is no error. Resolution order: stable `error.code` first, then a
// substring match on the message, then a generic fallback. When we fall
// through to generic, the raw error is reported to Sentry (PROD only) so we
// learn about new GoTrue codes/messages instead of silently swallowing them —
// the exact failure mode that hid "email déjà utilisé" behind a generic toast.
function translateError(error: SupabaseAuthError): string | null {
  if (!error) return null;
  const { message, code } = error;

  if (code) {
    const key = SUPABASE_CODE_KEYS[code];
    if (key) return i18n.t(`supabase_errors.${key}`, { ns: 'auth' });
  }

  if (message) {
    for (const [needle, key] of Object.entries(SUPABASE_ERROR_KEYS)) {
      if (message.includes(needle)) return i18n.t(`supabase_errors.${key}`, { ns: 'auth' });
    }
  }

  captureException(new Error('Unmapped Supabase auth error'), {
    contexts: { supabaseAuth: { code: code ?? null, message: message ?? null } },
  });
  return i18n.t('supabase_errors.generic', { ns: 'auth' });
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

/** After this duration in background, force a session refresh + data refetch */
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(!!supabase);
  const [sessionExpired, setSessionExpired] = useState(false);
  const mounted = useRef(true);
  const lastVisibleAt = useRef(Date.now());

  // Profile is fetched via TanStack Query, keyed on the authenticated user's
  // id. A null `userId` disables the query — preserves the "no profile when
  // logged out" invariant without a manual setProfile(null) on sign-out.
  const userId = user?.id;
  const profileQuery = useQuery<Profile | null>({
    queryKey: ['profile', userId ?? null],
    // `enabled` below guarantees queryFn only runs with a real userId, so the
    // non-null assertion is safe.
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId && !!supabase,
  });
  const profile = profileQuery.data ?? null;

  // Refresh session + invalidate all queries when returning from background
  // after inactivity. Every data hook now reads through TanStack Query; this
  // single `invalidateQueries()` call covers them all without the legacy
  // `dataGeneration` counter.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastVisibleAt.current;
        if (elapsed > STALE_THRESHOLD_MS && supabase) {
          supabase.auth
            .refreshSession()
            .then(() => {
              if (mounted.current) {
                queryClient.invalidateQueries();
              }
            })
            .catch(() => {
              // Refresh failed — session may be truly expired
            });
        }
        lastVisibleAt.current = Date.now();
      } else {
        lastVisibleAt.current = Date.now();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return;

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted.current) return;
        setUser(session?.user ?? null);
        setSessionLoading(false);
      })
      .catch((err) => {
        console.error('Session retrieval error:', err);
        if (mounted.current) setSessionLoading(false);
      });

    // Listen for auth changes (skip INITIAL_SESSION to avoid double update)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted.current || event === 'INITIAL_SESSION') return;

      // Session successfully refreshed — clear expired state
      if (event === 'TOKEN_REFRESHED') {
        setSessionExpired(false);
      }

      setUser(session?.user ?? null);
    });

    // Listen for session-expired events from supabaseQuery helper
    const onSessionExpired = () => {
      if (mounted.current) setSessionExpired(true);
    };
    sessionEvents.addEventListener('session-expired', onSessionExpired);

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
      sessionEvents.removeEventListener('session-expired', onSessionExpired);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  }, [queryClient, userId]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: translateError(error) };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: getAuthRedirectUrl('/auth/callback'),
        },
      });
      if (!error) captureEvent('signup_completed');
      return { error: translateError(error) };
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/reset-password'),
    });
    return { error: translateError(error) };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: translateError(error) };
  }, []);

  // Identify the user in PostHog on every transition to authenticated.
  // identifyUser is idempotent on the same id, so re-runs (token
  // refresh, browser tab focus) are cheap. signOut() handles the
  // reset side, so leaving the effect dependency-only on userId is
  // correct.
  useEffect(() => {
    if (userId) identifyUser(userId);
  }, [userId]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch {
      // Force local cleanup even if the API call fails (e.g. expired token)
    }
    setUser(null);
    setSessionExpired(false);
    queryClient.clear();
    resetAnalytics();
  }, [queryClient]);

  // `loading` stays true until both the initial session is resolved AND —
  // when a user was present — the profile query has finished its first
  // attempt. Keeps the previous invariant: consumers see no flash of
  // "authenticated but no profile" while the TanStack fetch is in flight.
  const loading = sessionLoading || (!!userId && profileQuery.isPending);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      sessionExpired,
      refreshProfile,
      signIn,
      signUp,
      resetPassword,
      updatePassword,
      signOut,
    }),
    [user, profile, loading, sessionExpired, refreshProfile, signIn, signUp, resetPassword, updatePassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
