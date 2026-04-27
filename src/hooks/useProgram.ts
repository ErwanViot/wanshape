import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Program, ProgramSession } from '../types/completion.ts';
import type { Session } from '../types/session.ts';

// Columns needed by ProgramCard / ProgramList. JSONB-heavy columns
// (progression, consignes_semaine, onboarding_data) and note_coach
// are intentionally excluded from list views — they're only consumed
// by ProgramPage which uses the full select('*') below.
const PROGRAM_LIST_COLS =
  'id, slug, title, description, goals, duration_weeks, frequency_per_week, fitness_level, is_fixed, locale';

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
        supabase!.from('programs').select(PROGRAM_LIST_COLS).eq('is_fixed', true).order('created_at'),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return [];
      }
      if (error) throw error;
      return (data as Program[]) ?? [];
    },
    enabled: !authLoading && !!supabase,
    // Fixed programs are seed data, only modified through migrations.
    // The user can never invalidate this cache by interacting with the
    // app — Infinity is the right answer.
    staleTime: Infinity,
  });

  return { programs: query.data ?? [], loading: query.isPending };
}

// Row shape returned by the embedded select below — program_sessions are
// nested, and each session_completions array is RLS-filtered to the
// current user, so any non-empty array means the session is completed.
type ProgramWithEmbeddedSessions = Program & {
  program_sessions: (ProgramSession & {
    session_completions: { id: string }[] | null;
  })[];
};

export function useProgram(slug: string | undefined, userId: string | undefined) {
  const query = useQuery<ProgramWithSessions | null>({
    queryKey: ['program', slug ?? null, userId ?? null],
    queryFn: async () => {
      // Single round-trip: fetch the program, its program_sessions and the
      // current user's completion rows for those sessions in one query.
      // session_completions is RLS-filtered to the authenticated user, so
      // the embed implicitly filters to "my completions only" — no
      // explicit user_id filter needed (and a public/anonymous read still
      // gets an empty array rather than every user's completions).
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('programs')
          .select('*, program_sessions(*, session_completions(id))')
          .eq('slug', slug!)
          .order('session_order', { referencedTable: 'program_sessions', ascending: true })
          .single(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      if (!data) return null;

      const row = data as ProgramWithEmbeddedSessions;
      const sessions: ProgramSession[] = (row.program_sessions ?? []).map(
        ({ session_completions: _ignore, ...sess }) => sess,
      );

      // Build the completed-id set only when a user is authenticated.
      // Anonymous reads can't satisfy the RLS check, so the embed comes
      // back empty for those — `userId` is the right guard.
      const completedIds = new Set<string>();
      if (userId) {
        for (const ps of row.program_sessions ?? []) {
          if (ps.session_completions && ps.session_completions.length > 0) {
            completedIds.add(ps.id);
          }
        }
      }

      return {
        ...row,
        sessions,
        completedSessionIds: completedIds,
      };
    },
    enabled: !!slug && !!supabase,
  });

  return { program: query.data ?? null, loading: query.isPending };
}

export function useProgramSession(slug: string | undefined, order: number | undefined) {
  const query = useQuery<ProgramSession | null>({
    queryKey: ['programSession', slug ?? null, order ?? null],
    queryFn: async () => {
      const { data: pgm, sessionExpired } = await supabaseQuery(() =>
        supabase!.from('programs').select('id').eq('slug', slug!).single(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      if (!pgm) return null;

      const { data: ps, sessionExpired: sessExp } = await supabaseQuery(() =>
        supabase!
          .from('program_sessions')
          .select('*')
          .eq('program_id', (pgm as { id: string }).id)
          .eq('session_order', order!)
          .single(),
      );
      if (sessExp) {
        notifySessionExpired();
        return null;
      }
      return (ps as ProgramSession | null) ?? null;
    },
    enabled: !!slug && order != null && !!supabase,
  });

  return { session: query.data ?? null, loading: query.isPending };
}
