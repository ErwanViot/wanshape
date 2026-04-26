import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import i18n from '../i18n/index.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { CustomSessionRecord } from '../types/custom-session.ts';

const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

export function useCustomSessions(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery<{ sessions: CustomSessionRecord[]; error: string | null }>({
    queryKey: ['customSessions', userId ?? null],
    queryFn: async () => {
      const {
        data,
        error: fetchError,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!
          .from('custom_sessions')
          .select('*')
          .eq('user_id', userId!)
          .eq('status', 'confirmed')
          .order('created_at', { ascending: false })
          .limit(20),
      );

      if (sessionExpired) {
        notifySessionExpired();
        return { sessions: [], error: tHookError('session_expired_refresh') };
      }
      if (fetchError) {
        return { sessions: [], error: tHookError('history_load_failed') };
      }
      return { sessions: (data as CustomSessionRecord[]) ?? [], error: null };
    },
    enabled: !!userId && !!supabase,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['customSessions', userId] });
  }, [queryClient, userId]);

  return {
    sessions: query.data?.sessions ?? [],
    loading: query.isPending,
    error: query.data?.error ?? null,
    refresh,
  };
}

export function useCustomSession(id: string | undefined, userId: string | undefined) {
  const query = useQuery<CustomSessionRecord | null>({
    queryKey: ['customSession', id ?? null, userId ?? null],
    queryFn: async () => {
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!.from('custom_sessions').select('*').eq('id', id!).eq('user_id', userId!).single(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      return (data as CustomSessionRecord | null) ?? null;
    },
    enabled: !!id && !!userId && !!supabase,
  });

  return { session: query.data ?? null, loading: query.isPending };
}

export async function confirmCustomSession(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase
      .from('custom_sessions')
      .update({ status: 'confirmed' })
      .eq('id', id)
      .eq('user_id', user.id);
    return !error;
  } catch (err) {
    console.error('Confirm custom session error:', err);
    return false;
  }
}
