import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { CustomSessionInput, GenerateSessionResponse } from '../types/custom-session.ts';

export function useGenerateSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: CustomSessionInput): Promise<GenerateSessionResponse | null> => {
    if (!supabase) {
      setError('Service indisponible');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-session', {
        body: input,
      });

      if (fnError) {
        // Extract our custom error message from the response body
        let message = 'Une erreur est survenue. Réessayez.';
        try {
          const ctx = (fnError as Record<string, unknown>).context;
          if (ctx && typeof (ctx as Response).json === 'function') {
            const body = await (ctx as Response).json();
            if (body?.error && typeof body.error === 'string') {
              message = body.error;
            }
          }
        } catch {
          // Ignore parsing errors, keep default message
        }
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
    }
  }, []);

  return { generate, loading, error };
}
