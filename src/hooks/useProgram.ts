import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { Program, ProgramSession, SessionCompletion } from '../types/completion.ts';

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
}

/** Returns the most recently active program for the given user (if any),
 *  including progression and next session info. */
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
        // Find the user's most recent program completion
        const { data: completion } = await supabase
          .from('session_completions')
          .select('program_session_id')
          .eq('user_id', userId)
          .not('program_session_id', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single();

        if (cancelled || !completion?.program_session_id) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Get the program session → program
        const { data: ps } = await supabase
          .from('program_sessions')
          .select('program_id')
          .eq('id', completion.program_session_id)
          .single();

        if (cancelled || !ps) {
          if (!cancelled) setLoading(false);
          return;
        }

        const { data: pgm } = await supabase
          .from('programs')
          .select('slug, title')
          .eq('id', ps.program_id)
          .single();

        if (cancelled || !pgm) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Fetch all sessions for this program
        const { data: allSessions } = await supabase
          .from('program_sessions')
          .select('id, session_order, session_data')
          .eq('program_id', ps.program_id)
          .order('session_order');

        const sessions = (allSessions as ProgramSession[] | null) ?? [];

        // Fetch user's completions for this program
        const sessionIds = sessions.map((s) => s.id);
        let completedIds = new Set<string>();
        if (sessionIds.length > 0) {
          const { data: completions } = await supabase
            .from('session_completions')
            .select('program_session_id')
            .eq('user_id', userId)
            .in('program_session_id', sessionIds);

          completedIds = new Set(
            (completions as Pick<SessionCompletion, 'program_session_id'>[] | null)
              ?.map((c) => c.program_session_id)
              .filter((id): id is string => id !== null) ?? [],
          );
        }

        if (cancelled) return;

        // Find next uncompleted session
        const nextSession = sessions.find((s) => !completedIds.has(s.id));
        const nextData = nextSession?.session_data as Record<string, unknown> | undefined;

        setActiveProgram({
          slug: pgm.slug,
          title: pgm.title,
          completedCount: completedIds.size,
          totalSessions: sessions.length,
          nextSessionTitle: (nextData?.title as string) ?? null,
          nextSessionOrder: nextSession?.session_order ?? null,
        });
        setLoading(false);
      } catch {
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
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await supabase.from('programs').select('*').eq('is_fixed', true).order('created_at');

        if (cancelled) return;
        setPrograms((data as Program[]) ?? []);
        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
        const { data: pgm } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', slug)
          .eq('is_fixed', true)
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
      } catch {
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
        // Find program by slug
        const { data: pgm } = await supabase
          .from('programs')
          .select('id')
          .eq('slug', slug)
          .eq('is_fixed', true)
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
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, order]);

  return { session, loading };
}
