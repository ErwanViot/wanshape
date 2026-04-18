import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Program, ProgramSession, SessionCompletion } from '../types/completion.ts';
import type { Session } from '../types/session.ts';

export interface ProgramWithSessions extends Program {
  sessions: ProgramSession[];
  completedSessionIds: Set<string>;
}

export interface ActiveProgramInfo {
  slug: string;
  title: string;
  completedCount: number;
  totalSessions: number;
  nextSessionTitle: string | null;
  nextSessionOrder: number | null;
  nextSessionData: Session | null;
  goals: string[];
  isFixed: boolean;
}

/** Returns the most recently active program for the given user (if any),
 *  including progression and next session info.
 *  Uses a single RPC call instead of 5 sequential queries.
 *
 *  Migrated to TanStack Query (phase 2): invalidated automatically by the
 *  visibility handler and by `useSaveCompletion` on session completion
 *  (which should call `queryClient.invalidateQueries({ queryKey:
 *  ['activeProgram', userId] })` — see migration contract in queryClient.ts). */
export function useActiveProgram(userId: string | undefined) {
  const query = useQuery<ActiveProgramInfo | null>({
    queryKey: ['activeProgram', userId ?? null],
    queryFn: async () => {
      // `enabled` below gates the query on userId + supabase, so these are
      // both non-null when queryFn runs.
      const { data, error, sessionExpired } = await supabaseQuery(() =>
        supabase!.rpc('get_active_program', { p_user_id: userId! }),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      if (error || !data) {
        if (error) console.error('Active program RPC error:', error);
        return null;
      }
      const d = data as {
        slug: string;
        title: string;
        totalSessions: number;
        completedCount: number;
        nextSessionOrder: number | null;
        nextSessionTitle: string | null;
        nextSessionData: Session | null;
        goals: string[];
        isFixed: boolean;
      };
      return {
        slug: d.slug,
        title: d.title,
        completedCount: d.completedCount,
        totalSessions: d.totalSessions,
        nextSessionTitle: d.nextSessionTitle,
        nextSessionOrder: d.nextSessionOrder,
        nextSessionData: d.nextSessionData,
        goals: d.goals ?? [],
        isFixed: d.isFixed ?? true,
      };
    },
    enabled: !!userId && !!supabase,
  });

  return { activeProgram: query.data ?? null, loading: query.isPending };
}

/** Lists the fixed (seed) programs — the "Choisis ton prochain défi" section
 *  on /programmes. User-generated programs live in `useUserPrograms`. */
export function usePrograms() {
  const { loading: authLoading } = useAuth();
  const query = useQuery<Program[]>({
    queryKey: ['programs', 'fixed'],
    queryFn: async () => {
      const { data, error, sessionExpired } = await supabaseQuery(() =>
        supabase!.from('programs').select('*').eq('is_fixed', true).order('created_at'),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return [];
      }
      if (error) throw error;
      return (data as Program[]) ?? [];
    },
    enabled: !authLoading && !!supabase,
  });

  return { programs: query.data ?? [], loading: query.isPending };
}

export function useProgram(slug: string | undefined, userId: string | undefined) {
  const { dataGeneration } = useAuth();
  const [program, setProgram] = useState<ProgramWithSessions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        // Fetch program (RLS handles access control)
        const { data: pgm, sessionExpired } = await supabaseQuery(() =>
          supabase!.from('programs').select('*').eq('slug', slug!).single(),
        );

        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (!pgm) {
          setLoading(false);
          return;
        }

        // Fetch program sessions
        const { data: sessions, sessionExpired: sessExp } = await supabaseQuery(() =>
          supabase!
            .from('program_sessions')
            .select('*')
            .eq('program_id', (pgm as Program).id)
            .order('session_order'),
        );

        if (cancelled) return;
        if (sessExp) {
          notifySessionExpired();
          setLoading(false);
          return;
        }

        // Fetch user's completions for this program's sessions
        const sessionIds = (sessions ?? []).map((s: ProgramSession) => s.id);
        let completedIds = new Set<string>();

        if (sessionIds.length > 0 && userId) {
          const { data: completions, sessionExpired: compExp } = await supabaseQuery(() =>
            supabase!
              .from('session_completions')
              .select('program_session_id')
              .eq('user_id', userId)
              .in('program_session_id', sessionIds),
          );

          if (compExp) {
            notifySessionExpired();
            setLoading(false);
            return;
          }

          completedIds = new Set(
            (completions as Pick<SessionCompletion, 'program_session_id'>[] | null)
              ?.map((c) => c.program_session_id)
              .filter((id): id is string => id !== null) ?? [],
          );
        }

        if (cancelled) return;

        setProgram({
          ...(pgm as Program),
          sessions: (sessions as ProgramSession[]) ?? [],
          completedSessionIds: completedIds,
        });
        setLoading(false);
      } catch (err) {
        console.error('Program fetch error:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, userId, dataGeneration]);

  return { program, loading };
}

export function useProgramSession(slug: string | undefined, order: number | undefined) {
  const { dataGeneration } = useAuth();
  const [session, setSession] = useState<ProgramSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || order == null || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data: pgm, sessionExpired } = await supabaseQuery(() =>
          supabase!.from('programs').select('id').eq('slug', slug!).single(),
        );

        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (!pgm) {
          setLoading(false);
          return;
        }

        const { data: ps, sessionExpired: sessExp } = await supabaseQuery(() =>
          supabase!
            .from('program_sessions')
            .select('*')
            .eq('program_id', (pgm as { id: string }).id)
            .eq('session_order', order!)
            .single(),
        );

        if (cancelled) return;
        if (sessExp) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        setSession((ps as ProgramSession) ?? null);
        setLoading(false);
      } catch (err) {
        console.error('Program session fetch error:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, order, dataGeneration]);

  return { session, loading };
}
