import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { ProgramOnboardingInput, GenerateProgramResponse } from '../types/custom-program.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useGenerateProgram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: ProgramOnboardingInput): Promise<GenerateProgramResponse | null> => {
    if (!supabase) {
      setError('Service indisponible');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-program', {
        body: input,
      });

      if (fnError) {
        const message = await extractEdgeFunctionError(
          fnError as unknown as Record<string, unknown>,
          'Une erreur est survenue. Reessaye.',
        );
        setError(message);
        return null;
      }

      if (data?.error) {
        setError(data.error);
        return null;
      }

      return data as GenerateProgramResponse;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error };
}
