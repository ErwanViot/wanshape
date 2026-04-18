import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type {
  DailyNutritionSummary,
  DailyNutritionTotals,
  MealLog,
  MealLogInsert,
  MealType,
} from '../types/nutrition.ts';
import { todayYYYYMMDD } from '../utils/nutritionDate.ts';

const EMPTY_TOTALS: DailyNutritionTotals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

function sumTotals(logs: MealLog[]): DailyNutritionTotals {
  return logs.reduce(
    (acc, log) => ({
      calories: acc.calories + (log.calories ?? 0),
      protein_g: acc.protein_g + (log.protein_g ?? 0),
      carbs_g: acc.carbs_g + (log.carbs_g ?? 0),
      fat_g: acc.fat_g + (log.fat_g ?? 0),
    }),
    EMPTY_TOTALS,
  );
}

function groupByMealType(logs: MealLog[]): Partial<Record<MealType, MealLog[]>> {
  const grouped: Partial<Record<MealType, MealLog[]>> = {};
  for (const log of logs) {
    let list = grouped[log.meal_type];
    if (!list) {
      list = [];
      grouped[log.meal_type] = list;
    }
    list.push(log);
  }
  return grouped;
}

export interface UseDailyNutritionResult {
  summary: DailyNutritionSummary;
  logs: MealLog[];
  loading: boolean;
  error: string | null;
  addMeal: (input: Omit<MealLogInsert, 'logged_date'> & { logged_date?: string }) => Promise<MealLog | null>;
  deleteMeal: (id: string) => Promise<boolean>;
  refresh: () => void;
}

export function useDailyNutrition(dateKey: string = todayYYYYMMDD()): UseDailyNutritionResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const inflightRef = useRef(false);

  const query = useQuery<{ logs: MealLog[]; error: string | null }>({
    queryKey: ['dailyNutrition', userId ?? null, dateKey],
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
          .eq('logged_date', dateKey)
          .order('created_at', { ascending: true }),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return { logs: [], error: null };
      }
      if (err) {
        return { logs: [], error: err.message ?? 'Erreur de chargement des repas' };
      }
      return { logs: (data ?? []) as MealLog[], error: null };
    },
    enabled: !!userId && !!supabase,
  });

  const logs = query.data?.logs ?? [];

  const addMeal = useCallback(
    async (input: Omit<MealLogInsert, 'logged_date'> & { logged_date?: string }) => {
      if (!userId || !supabase) return null;
      if (inflightRef.current) return null;
      inflightRef.current = true;
      try {
        const payload = { ...input, user_id: userId, logged_date: input.logged_date ?? dateKey };
        const {
          data,
          error: err,
          sessionExpired,
        } = await supabaseQuery(() => supabase!.from('meal_logs').insert(payload).select().single());
        if (sessionExpired) {
          notifySessionExpired();
          return null;
        }
        if (err) {
          return null;
        }
        const inserted = data as MealLog;
        // Optimistic update: push to the current cache, then invalidate so
        // any other day-dependent view (overflow insight) also refreshes.
        queryClient.setQueryData<{ logs: MealLog[]; error: string | null }>(
          ['dailyNutrition', userId, payload.logged_date],
          (prev) => ({ logs: [...(prev?.logs ?? []), inserted], error: null }),
        );
        queryClient.invalidateQueries({ queryKey: ['todayInsight', userId] });
        return inserted;
      } finally {
        inflightRef.current = false;
      }
    },
    [userId, dateKey, queryClient],
  );

  const deleteMeal = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return false;
      const { error: err, sessionExpired } = await supabaseQuery(() =>
        supabase!.from('meal_logs').delete().eq('id', id).eq('user_id', userId).select().single(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return false;
      }
      if (err) {
        return false;
      }
      queryClient.setQueryData<{ logs: MealLog[]; error: string | null }>(
        ['dailyNutrition', userId, dateKey],
        (prev) => ({ logs: (prev?.logs ?? []).filter((l) => l.id !== id), error: null }),
      );
      queryClient.invalidateQueries({ queryKey: ['todayInsight', userId] });
      return true;
    },
    [userId, dateKey, queryClient],
  );

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dailyNutrition', userId, dateKey] });
  }, [queryClient, userId, dateKey]);

  const summary = useMemo<DailyNutritionSummary>(() => {
    const totals = sumTotals(logs);
    const byMealType = groupByMealType(logs);
    return {
      date: dateKey,
      totals,
      byMealType,
      // Target is resolved at the consumer level via useNutritionProfile to
      // avoid duplicate fetches when both hooks are used on the same page.
      target: { calories: null, protein_g: null, carbs_g: null, fat_g: null },
    };
  }, [logs, dateKey]);

  return {
    summary,
    logs,
    loading: query.isPending,
    error: query.data?.error ?? null,
    addMeal,
    deleteMeal,
    refresh,
  };
}
