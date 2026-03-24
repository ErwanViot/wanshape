import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Program } from '../types/completion.ts';

export function useUserPrograms() {
  const { user, dataGeneration } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedOnce = useRef(false);

  // Depend on user.id (stable string) instead of user (unstable object ref)
  // to avoid re-creating fetchPrograms on every Supabase SIGNED_IN event.
  const userId = user?.id;

  const fetchPrograms = useCallback(async () => {
    if (!userId || !supabase) {
      hasFetchedOnce.current = false;
      setLoading(false);
      return;
    }

    // Only show loading on initial fetch — keep stale data visible during refetch
    if (!hasFetchedOnce.current) {
      setLoading(true);
    }
    try {
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('programs')
          .select('*')
          .eq('user_id', userId)
          .eq('is_fixed', false)
          .order('created_at', { ascending: false }),
      );

      if (sessionExpired) { notifySessionExpired(); return; }
      setPrograms((data as Program[]) ?? []);
      hasFetchedOnce.current = true;
    } catch (err) {
      console.error('User programs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms, dataGeneration]);

  const deleteProgram = useCallback(async (id: string) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id).eq('user_id', userId ?? '');
      if (error) {
        console.error('Delete program error:', error);
        return false;
      }
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      console.error('Delete program error:', err);
      return false;
    }
  }, [userId]);

  return { programs, loading, deleteProgram, refresh: fetchPrograms };
}
