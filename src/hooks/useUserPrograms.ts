import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
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

    try {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_fixed', false)
        .order('created_at', { ascending: false });

      setPrograms((data as Program[]) ?? []);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const deleteProgram = useCallback(async (id: string) => {
    if (!supabase) return false;

    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) {
        console.error('Delete program error:', error);
        return false;
      }
      setPrograms((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch {
      return false;
    }
  }, []);

  return { programs, loading, deleteProgram, refresh: fetchPrograms };
}
