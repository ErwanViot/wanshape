import type { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { sessionEvents } from '../lib/supabaseQuery.ts';
import type { Profile } from '../types/auth.ts';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  sessionExpired: boolean;
  dataGeneration: number;
  bumpDataGeneration: () => void;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ERROR_FR: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Confirme ton adresse email avant de te connecter.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'For security purposes, you can only request this after': 'Patiente avant de réessayer.',
  'Unable to validate email address: invalid format': 'Adresse email invalide.',
  'New password should be different from the old password': 'Le nouveau mot de passe doit être différent de l\u2019ancien.',
  'Auth session missing': 'Session expirée. Reconnecte-toi.',
  'Email rate limit exceeded': 'Trop de tentatives. Patiente quelques minutes.',
};

function translateError(message: string | undefined): string | null {
  if (!message) return null;
  for (const [en, fr] of Object.entries(ERROR_FR)) {
    if (message.includes(en)) return fr;
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

/** After this duration in background, force a session refresh + data refetch */
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [dataGeneration, setDataGeneration] = useState(0);
  const mounted = useRef(true);
  const lastVisibleAt = useRef(Date.now());

  // Refresh session + bump dataGeneration when returning from background after inactivity
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastVisibleAt.current;
        if (elapsed > STALE_THRESHOLD_MS && supabase) {
          supabase.auth.refreshSession().then(() => {
            if (mounted.current) {
              setDataGeneration((g) => g + 1);
            }
          }).catch(() => {
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
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!supabase) return;

    // Initial session check
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted.current) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try {
            const p = await fetchProfile(currentUser.id);
            if (mounted.current) setProfile(p);
          } catch (err) {
            console.error('Profile fetch error (initial):', err);
          }
        }
        if (mounted.current) setLoading(false);
      })
      .catch((err) => {
        console.error('Session retrieval error:', err);
        if (mounted.current) setLoading(false);
      });

    // Listen for auth changes (skip INITIAL_SESSION to avoid double fetch)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current || event === 'INITIAL_SESSION') return;

      // Session successfully refreshed — clear expired state
      if (event === 'TOKEN_REFRESHED') {
        setSessionExpired(false);
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try {
          const p = await fetchProfile(currentUser.id);
          if (mounted.current) setProfile(p);
        } catch (err) {
          console.error('Profile fetch error (auth change):', err);
        }
      } else {
        setProfile(null);
      }
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
    if (!user) return;
    try {
      const p = await fetchProfile(user.id);
      if (mounted.current) setProfile(p);
    } catch (err) {
      console.error('Profile refresh error:', err);
    }
  }, [user]);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: translateError(error?.message) };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { error: translateError(error?.message) };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: translateError(error?.message) };
  }, []);

  const updatePassword = useCallback(async (password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
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
    setProfile(null);
    setSessionExpired(false);
  }, []);

  const bumpDataGeneration = useCallback(() => setDataGeneration((g) => g + 1), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, sessionExpired, dataGeneration, bumpDataGeneration, refreshProfile, signIn, signUp, resetPassword, updatePassword, signOut }),
    [user, profile, loading, sessionExpired, dataGeneration, bumpDataGeneration, refreshProfile, signIn, signUp, resetPassword, updatePassword, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
