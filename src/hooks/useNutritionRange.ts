import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import i18n from '../i18n/index.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { MealLog, NutritionRangeSummary } from '../types/nutrition.ts';
import { buildRangeSummary } from '../utils/nutritionRange.ts';
import { useNutritionProfile } from './useNutritionProfile.ts';

const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

export interface UseNutritionRangeResult {
  summary: NutritionRangeSummary | null;
  loading: boolean;
  error: string | null;
}

export interface UseNutritionRangeOptions {
  /** Lazy gate: when false, the query stays disabled. */
  enabled?: boolean;
}

/**
 * Fetches all meal_logs for `[startDate, endDate]` (inclusive YYYYMMDD) and
 * rolls them up into per-day briefs + week/range averages. Aggregation is
 * client-side because the index `idx_meal_logs_user_date` makes range scans
 * cheap (~450 rows max for a 30-day window) and avoids needing an RPC.
 */
export function useNutritionRange(
  startDate: string,
  endDate: string,
  options: UseNutritionRangeOptions = {},
): UseNutritionRangeResult {
  const { user } = useAuth();
  const userId = user?.id;
  const { profile } = useNutritionProfile();
  const target = profile?.target_calories ?? null;

  const enabled = (options.enabled ?? true) && !!userId && !!supabase;

  const query = useQuery<{ logs: MealLog[]; error: string | null }>({
    queryKey: ['nutritionRange', userId ?? null, startDate, endDate],
    queryFn: async () => {
      const {
        data,
        error: err,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!
          .from('meal_logs')
          .select('*')
          .eq('user_id', userId!)
          .gte('logged_date', startDate)
          .lte('logged_date', endDate)
          .order('logged_date', { ascending: true }),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return { logs: [], error: null };
      }
      if (err) {
        return { logs: [], error: err.message ?? tHookError('meals_load_failed') };
      }
      return { logs: (data ?? []) as MealLog[], error: null };
    },
    enabled,
    // Historical days are effectively immutable once the day is past — bump
    // staleTime so navigating back and forth doesn't trigger refetches.
    staleTime: 5 * 60 * 1000,
  });

  const summary = useMemo<NutritionRangeSummary | null>(() => {
    if (!query.data) return null;
    return buildRangeSummary(query.data.logs, startDate, endDate, target);
  }, [query.data, startDate, endDate, target]);

  return {
    summary,
    loading: query.isPending && enabled,
    error: query.data?.error ?? null,
  };
}
