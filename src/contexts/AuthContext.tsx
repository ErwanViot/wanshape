import type { User } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import i18n from '../i18n';
import { getAuthRedirectUrl } from '../lib/auth-redirects.ts';
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
const SUPABASE_ERROR_KEYS: Record<string, string> = {
  'Invalid login credentials': 'invalid_credentials',
  'Email not confirmed': 'email_not_confirmed',
  'User already registered': 'user_already_registered',
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

function translateError(message: string | undefined): string | null {
  if (!message) return null;
  for (const [needle, key] of Object.entries(SUPABASE_ERROR_KEYS)) {
    if (message.includes(needle)) return i18n.t(`supabase_errors.${key}`, { ns: 'auth' });
  }
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
    return { error: translateError(error?.message) };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
      if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      return { error: translateError(error?.message) };
    },
    [],
  );

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/reset-password'),
    });
    return { error: translateError(error?.message) };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: i18n.t('errors.auth_unavailable', { ns: 'auth' }) };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: translateError(error?.message) };
  }, []);

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
