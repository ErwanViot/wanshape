import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
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
}

/** Returns the most recently active program for the given user (if any),
 *  including progression and next session info.
 *  Uses a single RPC call instead of 5 sequential queries. */
export function useActiveProgram(userId: string | undefined) {
  const [activeProgram, setActiveProgram] = useState<ActiveProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.rpc('get_active_program', {
          p_user_id: userId,
        });

        if (cancelled) return;

        if (error) {
          console.error('Active program RPC error:', error);
          setLoading(false);
          return;
        }

        if (!data) {
          setLoading(false);
          return;
        }

        const d = data as {
          slug: string;
          title: string;
          totalSessions: number;
          completedCount: number;
          nextSessionOrder: number | null;
          nextSessionTitle: string | null;
          nextSessionData: Session | null;
        };

        setActiveProgram({
          slug: d.slug,
          title: d.title,
          completedCount: d.completedCount,
          totalSessions: d.totalSessions,
          nextSessionTitle: d.nextSessionTitle,
          nextSessionOrder: d.nextSessionOrder,
          nextSessionData: d.nextSessionData,
        });
        setLoading(false);
      } catch (err) {
        console.error('Active program fetch error:', err);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { activeProgram, loading };
}

export function usePrograms() {
  const { loading: authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to settle so the Supabase client is fully initialized
    if (!supabase || authLoading) return;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase.from('programs').select('*').eq('is_fixed', true).order('created_at');

        if (cancelled) return;
        if (error) throw error;
        setPrograms((data as Program[]) ?? []);
      } catch (err) {
        console.error('Programs fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  return { programs, loading };
}

export function useProgram(slug: string | undefined) {
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
        // Fetch program
        // RLS handles access control (fixed programs + own programs)
        const { data: pgm } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (cancelled || !pgm) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Fetch program sessions
        const { data: sessions } = await supabase
          .from('program_sessions')
          .select('*')
          .eq('program_id', pgm.id)
          .order('session_order');

        // Fetch user's completions for this program's sessions
        const sessionIds = (sessions ?? []).map((s: ProgramSession) => s.id);
        let completedIds = new Set<string>();

        if (sessionIds.length > 0) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: completions } = await supabase
              .from('session_completions')
              .select('program_session_id')
              .eq('user_id', user.id)
              .in('program_session_id', sessionIds);

            completedIds = new Set(
              (completions as Pick<SessionCompletion, 'program_session_id'>[] | null)
                ?.map((c) => c.program_session_id)
                .filter((id): id is string => id !== null) ?? [],
            );
          }
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
  }, [slug]);

  return { program, loading };
}

export function useProgramSession(slug: string | undefined, order: number | undefined) {
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
        // Find program by slug (RLS handles access control)
        const { data: pgm } = await supabase
          .from('programs')
          .select('id')
          .eq('slug', slug)
          .single();

        if (cancelled || !pgm) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Find session by order
        const { data: ps } = await supabase
          .from('program_sessions')
          .select('*')
          .eq('program_id', pgm.id)
          .eq('session_order', order)
          .single();

        if (cancelled) return;
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
  }, [slug, order]);

  return { session, loading };
}
