import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { isSupportedLocale } from '../i18n';
import { supabase } from '../lib/supabase.ts';
import type { GenerateProgramResponse, ProgramOnboardingInput } from '../types/custom-program.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useGenerateProgram() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef(false);

  const generate = useCallback(
    async (input: ProgramOnboardingInput): Promise<GenerateProgramResponse | null> => {
      if (inflightRef.current) return null;
      if (!supabase) {
        setError('Service indisponible');
        return null;
      }

      inflightRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const locale = isSupportedLocale(i18n.language) ? i18n.language : 'fr';
        const { data, error: fnError } = await supabase.functions.invoke('generate-program', {
          body: { ...input, locale },
        });

        if (fnError) {
          const message = await extractEdgeFunctionError(
            fnError as unknown as Record<string, unknown>,
            'Une erreur est survenue. Réessaye.',
          );
          setError(message);
          return null;
        }

        if (data?.error) {
          setError(data.error);
          return null;
        }

        // The new program must appear in the user programs list and may become
        // the active program on first session completion. Use `userId ?? null`
        // so the keys match the ones the read hooks registered (TanStack keys
        // are compared with strict ===, so undefined ≠ null).
        queryClient.invalidateQueries({ queryKey: ['userPrograms', userId ?? null] });
        queryClient.invalidateQueries({ queryKey: ['activeProgram', userId ?? null] });

        return data as GenerateProgramResponse;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inattendue');
        return null;
      } finally {
        setLoading(false);
        inflightRef.current = false;
      }
    },
    [queryClient, userId, i18n.language],
  );

  return { generate, loading, error };
}
