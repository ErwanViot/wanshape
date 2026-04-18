import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const queryKey = ['todayInsight', userId ?? null, dateKey];

  const query = useQuery<{ insight: NutritionInsight | null; error: string | null }>({
    queryKey,
    queryFn: async () => {
      const {
        data,
        error: err,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!
          .from('nutrition_insights')
          .select('*')
          .eq('user_id', userId!)
          .eq('logged_date', dateKey)
          .maybeSingle(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return { insight: null, error: null };
      }
      if (err) {
        return { insight: null, error: err.message ?? "Erreur de chargement de l'analyse" };
      }
      return { insight: (data as NutritionInsight | null) ?? null, error: null };
    },
    enabled: !!userId && !!supabase,
  });

  const setInsight = useCallback(
    (next: NutritionInsight | null) => {
      // Direct cache write keeps generateInsight-style consumers trivially
      // imperative (call setInsight(result) after the AI call resolves).
      queryClient.setQueryData(queryKey, { insight: next, error: null });
    },
    [queryClient, queryKey],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    insight: query.data?.insight ?? null,
    loading: query.isPending,
    error: query.data?.error ?? null,
    setInsight,
    refresh,
  };
}
