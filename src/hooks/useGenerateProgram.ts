import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { isSupportedLocale } from '../i18n';
import { captureEvent } from '../lib/analytics.ts';
import { supabase } from '../lib/supabase.ts';
import type { GenerateProgramResponse, ProgramOnboardingInput, ProgramStatus } from '../types/custom-program.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

/** Revision request: adjust an existing (not-yet-started) program in place. */
export interface ReviseOptions {
  programId: string;
  comment: string;
}

const POLL_INTERVAL_MS = 3000;
// Generation runs server-side up to the 400s wall-clock; poll a bit beyond that
// before giving up on the client. The program keeps generating regardless and
// will appear ready in the list — the timeout only ends THIS overlay.
const POLL_TIMEOUT_MS = 7 * 60 * 1000;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function useGenerateProgram() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef(false);

  // Poll a single program's status until it leaves 'generating' (or we time
  // out). RLS lets a user read their own row, so the anon/publishable client
  // is enough here.
  const pollUntilSettled = useCallback(
    async (programId: string): Promise<{ status: ProgramStatus | 'timeout'; error_reason: string | null }> => {
      const startedAt = Date.now();
      while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
        await sleep(POLL_INTERVAL_MS);
        const { data } = await supabase!
          .from('programs')
          .select('status, error_reason')
          .eq('id', programId)
          .maybeSingle();
        const status = (data?.status as ProgramStatus | undefined) ?? 'ready';
        if (status !== 'generating') {
          return { status, error_reason: (data?.error_reason as string | null) ?? null };
        }
      }
      return { status: 'timeout', error_reason: null };
    },
    [],
  );

  // i18n.t is a fresh function reference each render; depending on i18n.language
  // is the project-wide pattern for stable callbacks resolving localised strings.
  // biome-ignore lint/correctness/useExhaustiveDependencies: i18n.language is the stable trigger, not i18n.t.
  const generate = useCallback(
    async (input: ProgramOnboardingInput, revise?: ReviseOptions): Promise<GenerateProgramResponse | null> => {
      if (inflightRef.current) return null;
      if (!supabase) {
        setError(i18n.t('hook_errors.service_unavailable', { ns: 'common' }));
        return null;
      }

      inflightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const locale = isSupportedLocale(i18n.language) ? i18n.language : 'fr';
        const body: Record<string, unknown> = { ...input, locale };
        if (revise) {
          body.revision_program_id = revise.programId;
          body.revision_comment = revise.comment;
        }

        const { data, error: fnError } = await supabase.functions.invoke('generate-program', { body });

        if (fnError) {
          const message = await extractEdgeFunctionError(
            fnError as unknown as Record<string, unknown>,
            i18n.t('hook_errors.generic_retry', { ns: 'common' }),
          );
          setError(message);
          return null;
        }

        if (data?.error) {
          setError(data.error);
          return null;
        }

        const response = data as GenerateProgramResponse;
        if (!response?.programId) {
          setError(i18n.t('hook_errors.generic_retry', { ns: 'common' }));
          return null;
        }

        // Show the `generating` placeholder in the list right away (fire-and-
        // forget: the user can leave this screen and find it there).
        queryClient.invalidateQueries({ queryKey: ['userPrograms', userId ?? null] });

        // The generation runs in the background (edge waitUntil). Poll until the
        // row settles so the overlay can navigate on ready / surface failures.
        const settled = await pollUntilSettled(response.programId);

        queryClient.invalidateQueries({ queryKey: ['userPrograms', userId ?? null] });
        queryClient.invalidateQueries({ queryKey: ['activeProgram', userId ?? null] });

        if (settled.status === 'failed') {
          setError(settled.error_reason || i18n.t('hook_errors.generic_retry', { ns: 'common' }));
          return null;
        }
        if (settled.status === 'timeout') {
          // Not an error per se — the program is still being generated and will
          // appear in the list. Tell the user where to find it.
          setError(i18n.t('generating.timeout', { ns: 'programs' }));
          return null;
        }

        captureEvent(revise ? 'program_revised' : 'program_created', {
          objectifs: input.objectifs,
          experience_duree: input.experience_duree,
          frequence_actuelle: input.frequence_actuelle,
          seances_par_semaine: input.seances_par_semaine,
          duree_semaines: input.duree_semaines,
        });

        return { ...response, status: 'ready' };
      } catch (e) {
        setError(e instanceof Error ? e.message : i18n.t('hook_errors.unexpected', { ns: 'common' }));
        return null;
      } finally {
        setLoading(false);
        inflightRef.current = false;
      }
    },
    [queryClient, userId, i18n.language, pollUntilSettled],
  );

  return { generate, loading, error };
}
