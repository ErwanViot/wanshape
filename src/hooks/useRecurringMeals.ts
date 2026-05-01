import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { MealLog, MealType } from '../types/nutrition.ts';
import { shiftYYYYMMDD, todayYYYYMMDD } from '../utils/nutritionDate.ts';
import { buildRecurringMeals, type RecurringMeal } from '../utils/recurringMeals.ts';

const WINDOW_DAYS = 30;

export interface UseRecurringMealsResult {
  items: RecurringMeal[];
  loading: boolean;
}

export function useRecurringMeals(mealType: MealType): UseRecurringMealsResult {
  const { user } = useAuth();
  const userId = user?.id;
  const today = todayYYYYMMDD();
  const since = shiftYYYYMMDD(today, -WINDOW_DAYS) ?? today;

  const query = useQuery<MealLog[]>({
    queryKey: ['recurringMeals', userId ?? null, mealType, since],
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
          .eq('meal_type', mealType)
          .gte('logged_date', since)
          .order('logged_date', { ascending: false })
          .limit(200),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return [];
      }
      if (err) return [];
      return (data ?? []) as MealLog[];
    },
    enabled: !!userId && !!supabase,
    staleTime: 60_000,
  });

  const items = useMemo(() => buildRecurringMeals(query.data ?? []), [query.data]);

  return { items, loading: query.isPending };
}
