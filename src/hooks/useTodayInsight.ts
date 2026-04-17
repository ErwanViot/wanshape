import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { NutritionInsight } from '../types/nutrition.ts';
import { todayYYYYMMDD } from '../utils/nutritionDate.ts';

export interface UseTodayInsightResult {
  insight: NutritionInsight | null;
  loading: boolean;
  error: string | null;
  setInsight: (next: NutritionInsight | null) => void;
  refresh: () => void;
}

/**
 * Loads the insight for `dateKey` if any. Separate from useEstimateNutrition
 * because the insight is persisted on the server; the hook fetches on mount
 * and lets the consumer update it after a generation.
 */
export function useTodayInsight(dateKey: string = todayYYYYMMDD()): UseTodayInsightResult {
  const { user, dataGeneration } = useAuth();
  const userId = user?.id;
  const [insight, setInsight] = useState<NutritionInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localGeneration, setLocalGeneration] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dataGeneration + localGeneration force re-fetch
  useEffect(() => {
    if (!userId || !supabase) {
      setInsight(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const {
          data,
          error: err,
          sessionExpired,
        } = await supabaseQuery(() =>
          supabase!
            .from('nutrition_insights')
            .select('*')
            .eq('user_id', userId)
            .eq('logged_date', dateKey)
            .maybeSingle(),
        );
        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (err) {
          setError(err.message ?? "Erreur de chargement de l'analyse");
          setLoading(false);
          return;
        }
        setInsight((data as NutritionInsight | null) ?? null);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, dateKey, dataGeneration, localGeneration]);

  const refresh = useCallback(() => {
    setLocalGeneration((g) => g + 1);
  }, []);

  return { insight, loading, error, setInsight, refresh };
}
