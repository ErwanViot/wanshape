import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { Profile } from '../types/auth.ts';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ERROR_FR: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'Email not confirmed': 'Veuillez confirmer votre adresse email avant de vous connecter.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'For security purposes, you can only request this after': 'Veuillez patienter avant de réessayer.',
  'Unable to validate email address: invalid format': 'Adresse email invalide.',
  'New password should be different from the old password': 'Le nouveau mot de passe doit être différent de l\u2019ancien.',
  'Auth session missing': 'Session expirée. Veuillez vous reconnecter.',
  'Email rate limit exceeded': 'Trop de tentatives. Veuillez patienter quelques minutes.',
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const mounted = useRef(true);

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
          } catch {
            // Profile fetch failed — continue without profile
          }
        }
        if (mounted.current) setLoading(false);
      })
      .catch(() => {
        // Session retrieval failed — mark as loaded with no user
        if (mounted.current) setLoading(false);
      });

    // Listen for auth changes (skip INITIAL_SESSION to avoid double fetch)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted.current || event === 'INITIAL_SESSION') return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try {
          const p = await fetchProfile(currentUser.id);
          if (mounted.current) setProfile(p);
        } catch {
          // Profile fetch failed — continue without profile
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: translateError(error?.message) };
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { error: translateError(error?.message) };
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: translateError(error?.message) };
  };

  const updatePassword = async (password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: translateError(error?.message) };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, resetPassword, updatePassword, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
