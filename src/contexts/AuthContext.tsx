import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { Profile } from '../types/auth.ts';

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signUp: (email: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setProfile(await fetchProfile(currentUser.id));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setProfile(await fetchProfile(currentUser.id));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, displayName: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Auth non disponible' };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { display_name: displayName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
