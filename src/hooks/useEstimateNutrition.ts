import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import type { NutritionInsight, TextEstimate } from '../types/nutrition.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export interface TextEstimateResponse {
  estimate: TextEstimate;
  usage: { model: string; input_tokens: number | null; output_tokens: number | null };
  loggedDate: string;
}

export interface OverflowResponse {
  insight: NutritionInsight;
  loggedDate: string;
}

export interface UseEstimateNutritionResult {
  estimateFromText: (description: string, loggedDate?: string) => Promise<TextEstimateResponse | null>;
  generateOverflowInsight: (loggedDate?: string) => Promise<OverflowResponse | null>;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Wrapper around the `estimate-nutrition` edge function. Handles both premium
 * features (text-free estimate + daily overflow insight). inflightRef prevents
 * duplicate submits from rapid clicks.
 */
export function useEstimateNutrition(): UseEstimateNutritionResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef(false);

  const call = useCallback(async <T>(body: Record<string, unknown>): Promise<T | null> => {
    if (!supabase) return null;
    if (inflightRef.current) return null;
    inflightRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke<T>('estimate-nutrition', {
        body,
      });
      if (fnError) {
        const msg = await extractEdgeFunctionError(
          fnError as unknown as Record<string, unknown>,
          'Estimation indisponible.',
        );
        setError(msg);
        return null;
      }
      return (data ?? null) as T | null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return null;
    } finally {
      inflightRef.current = false;
      setLoading(false);
    }
  }, []);

  const estimateFromText = useCallback(
    (description: string, loggedDate?: string) => call<TextEstimateResponse>({ mode: 'text', description, loggedDate }),
    [call],
  );

  const generateOverflowInsight = useCallback(
    (loggedDate?: string) =>
      call<OverflowResponse>({
        mode: 'overflow',
        loggedDate,
        localHourOfDay: new Date().getHours(),
      }),
    [call],
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { estimateFromText, generateOverflowInsight, loading, error, reset };
}
