import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { ProgramOnboardingInput, GenerateProgramResponse } from '../types/custom-program.ts';

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
        let message = 'Une erreur est survenue. Reessaye.';
        try {
          const ctx = (fnError as Record<string, unknown>).context;
          if (ctx && typeof (ctx as Response).json === 'function') {
            const body = await (ctx as Response).json();
            if (body?.error && typeof body.error === 'string') {
              message = body.error;
            }
          }
        } catch {
          // Ignore parsing errors
        }
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
