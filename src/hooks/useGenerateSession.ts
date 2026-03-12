import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { CustomSessionInput, GenerateSessionResponse } from '../types/custom-session.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useGenerateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef(false);

  const generate = useCallback(async (input: CustomSessionInput): Promise<GenerateSessionResponse | null> => {
    if (inflightRef.current) return null;
    if (!supabase) {
      setError('Service indisponible');
      return null;
    }

    inflightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-session', {
        body: input,
      });

      if (fnError) {
        const message = await extractEdgeFunctionError(
          fnError as unknown as Record<string, unknown>,
          'Une erreur est survenue. Réessayez.',
        );
        setError(message);
        return null;
      }

      if (data?.error) {
        setError(data.error);
        return null;
      }

      return data as GenerateSessionResponse;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inattendue');
      return null;
    } finally {
      setLoading(false);
      inflightRef.current = false;
    }
  }, []);

  return { generate, loading, error };
}
