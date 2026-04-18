import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { CustomSessionInput, GenerateSessionResponse } from '../types/custom-session.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useGenerateSession() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inflightRef = useRef(false);

  const generate = useCallback(
    async (input: CustomSessionInput): Promise<GenerateSessionResponse | null> => {
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

        // The new session row enters `custom_sessions` via the edge function;
        // invalidate the user's list so "Mes séances précédentes" shows it
        // immediately on the next render. Use `userId ?? null` so the key
        // matches the one the read hook registered for logged-out visitors
        // (TanStack compares keys with strict ===, so undefined ≠ null).
        queryClient.invalidateQueries({ queryKey: ['customSessions', userId ?? null] });

        return data as GenerateSessionResponse;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inattendue');
        return null;
      } finally {
        setLoading(false);
        inflightRef.current = false;
      }
    },
    [queryClient, userId],
  );

  return { generate, loading, error };
}
