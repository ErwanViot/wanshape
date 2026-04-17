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

export interface CallOutcome<T> {
  data: T | null;
  error: string | null;
}

export interface UseEstimateNutritionResult {
  estimateFromText: (description: string, loggedDate?: string) => Promise<CallOutcome<TextEstimateResponse>>;
  generateOverflowInsight: (loggedDate?: string) => Promise<CallOutcome<OverflowResponse>>;
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

  const call = useCallback(async <T>(body: Record<string, unknown>): Promise<CallOutcome<T>> => {
    if (!supabase) return { data: null, error: 'Service indisponible.' };
    if (inflightRef.current) return { data: null, error: null };
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
        return { data: null, error: msg };
      }
      return { data: (data ?? null) as T | null, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      return { data: null, error: msg };
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
