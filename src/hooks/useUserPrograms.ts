import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Program } from '../types/completion.ts';

export function useUserPrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!user || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_fixed', false)
          .order('created_at', { ascending: false }),
      );

      if (sessionExpired) { notifySessionExpired(); return; }
      setPrograms((data as Program[]) ?? []);
    } catch (err) {
      console.error('User programs fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refetch on mount (key={pathname} in PublicLayout forces remount on navigation)
  // and when user or dataGeneration changes (idle return)
  const { dataGeneration } = useAuth();
  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms, dataGeneration]);

  const deleteProgram = useCallback(async (id: string) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id).eq('user_id', user?.id ?? '');
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
  }, [user]);

  return { programs, loading, deleteProgram, refresh: fetchPrograms };
}
