import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useNutritionProfile } from './useNutritionProfile.ts';

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
  const { user, dataGeneration } = useAuth();
  const userId = user?.id;
  const { profile } = useNutritionProfile();
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localGeneration, setLocalGeneration] = useState(0);
  const inflightRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dataGeneration + localGeneration force re-fetch
  useEffect(() => {
    if (!userId || !supabase) {
      setLogs([]);
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
            .from('meal_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('logged_date', dateKey)
            .order('created_at', { ascending: true }),
        );
        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (err) {
          setError(err.message ?? 'Erreur de chargement des repas');
          setLoading(false);
          return;
        }
        setLogs((data ?? []) as MealLog[]);
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
          setError(err.message ?? "Erreur lors de l'ajout du repas");
          return null;
        }
        const inserted = data as MealLog;
        setLogs((prev) => [...prev, inserted]);
        return inserted;
      } finally {
        inflightRef.current = false;
      }
    },
    [userId, dateKey],
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
        setError(err.message ?? 'Erreur lors de la suppression');
        return false;
      }
      setLogs((prev) => prev.filter((l) => l.id !== id));
      return true;
    },
    [userId],
  );

  const refresh = useCallback(() => {
    setLocalGeneration((g) => g + 1);
  }, []);

  const summary = useMemo<DailyNutritionSummary>(() => {
    const totals = sumTotals(logs);
    const byMealType = groupByMealType(logs);
    return {
      date: dateKey,
      totals,
      byMealType,
      target: {
        calories: profile?.target_calories ?? null,
        protein_g: profile?.target_protein_g ?? null,
        carbs_g: profile?.target_carbs_g ?? null,
        fat_g: profile?.target_fat_g ?? null,
      },
    };
  }, [logs, profile, dateKey]);

  return { summary, logs, loading, error, addMeal, deleteMeal, refresh };
}
