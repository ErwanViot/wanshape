import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { Program, ProgramSession, SessionCompletion } from '../types/completion.ts';

export interface ProgramWithSessions extends Program {
  sessions: ProgramSession[];
  completedSessionIds: Set<string>;
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

    supabase
      .from('programs')
      .select('*')
      .eq('is_fixed', true)
      .order('created_at')
      .then(({ data }) => {
        if (cancelled) return;
        setPrograms((data as Program[]) ?? []);
        setLoading(false);
      });

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
      // Fetch program
      const { data: pgm } = await supabase.from('programs').select('*').eq('slug', slug).eq('is_fixed', true).single();

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
      // Find program by slug
      const { data: pgm } = await supabase.from('programs').select('id').eq('slug', slug).eq('is_fixed', true).single();

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
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, order]);

  return { session, loading };
}
