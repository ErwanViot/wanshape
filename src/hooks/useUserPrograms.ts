import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Program } from '../types/completion.ts';

export function useUserPrograms() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery<Program[]>({
    queryKey: ['userPrograms', userId ?? null],
    queryFn: async () => {
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('programs')
          .select('*')
          .eq('user_id', userId!)
          .eq('is_fixed', false)
          .order('created_at', { ascending: false }),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return [];
      }
      return (data as Program[]) ?? [];
    },
    enabled: !!userId && !!supabase,
  });

  const deleteProgram = useCallback(
    async (id: string) => {
      if (!supabase || !userId) return false;
      try {
        const { error } = await supabase.from('programs').delete().eq('id', id).eq('user_id', userId);
        if (error) {
          console.error('Delete program error:', error);
          return false;
        }
        // Optimistic local update + invalidate so the active-program query
        // (which may have pointed at this program) is also refreshed.
        queryClient.setQueryData<Program[] | undefined>(['userPrograms', userId], (prev) =>
          prev?.filter((p) => p.id !== id),
        );
        queryClient.invalidateQueries({ queryKey: ['activeProgram', userId] });
        return true;
      } catch (err) {
        console.error('Delete program error:', err);
        return false;
      }
    },
    [userId, queryClient],
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['userPrograms', userId] });
  }, [queryClient, userId]);

  return { programs: query.data ?? [], loading: query.isPending, deleteProgram, refresh };
}
