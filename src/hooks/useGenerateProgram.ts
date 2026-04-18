import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { GenerateProgramResponse, ProgramOnboardingInput } from '../types/custom-program.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useGenerateProgram() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
        const { data, error: fnError } = await supabase.functions.invoke('generate-program', {
          body: input,
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
        // the active program on first session completion. Invalidate both so
        // the redirect target page shows the fresh data.
        queryClient.invalidateQueries({ queryKey: ['userPrograms', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['activeProgram', user?.id] });

        return data as GenerateProgramResponse;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inattendue');
        return null;
      } finally {
        setLoading(false);
        inflightRef.current = false;
      }
    },
    [queryClient, user?.id],
  );

  return { generate, loading, error };
}
