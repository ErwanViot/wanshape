import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { NutritionProfile, NutritionProfileUpsert } from '../types/nutrition.ts';

export interface UseNutritionProfileResult {
  profile: NutritionProfile | null;
  loading: boolean;
  error: string | null;
  upsert: (patch: NutritionProfileUpsert) => Promise<NutritionProfile | null>;
  clearTarget: () => Promise<void>;
  refresh: () => void;
}

export function useNutritionProfile(): UseNutritionProfileResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery<{ profile: NutritionProfile | null; error: string | null }>({
    queryKey: ['nutritionProfile', userId ?? null],
    queryFn: async () => {
      const {
        data,
        error: err,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!.from('nutrition_profiles').select('*').eq('user_id', userId!).maybeSingle(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return { profile: null, error: null };
      }
      if (err) {
        return { profile: null, error: err.message ?? 'Erreur de chargement du profil' };
      }
      return { profile: (data as NutritionProfile | null) ?? null, error: null };
    },
    enabled: !!userId && !!supabase,
  });

  const upsert = useCallback(
    async (patch: NutritionProfileUpsert) => {
      if (!userId || !supabase) return null;
      const {
        data,
        error: err,
        sessionExpired,
      } = await supabaseQuery(() =>
        supabase!
          .from('nutrition_profiles')
          .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' })
          .select()
          .single(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      if (err) {
        return null;
      }
      const next = (data as NutritionProfile | null) ?? null;
      // Update the cache optimistically so subsequent reads see the new value
      // immediately, then let the next background refetch reconcile.
      queryClient.setQueryData(['nutritionProfile', userId], { profile: next, error: null });
      // Invalidate the daily nutrition view (it reads the target calories).
      queryClient.invalidateQueries({ queryKey: ['dailyNutrition', userId] });
      return next;
    },
    [userId, queryClient],
  );

  const clearTarget = useCallback(async () => {
    await upsert({
      target_calories: null,
      target_protein_g: null,
      target_carbs_g: null,
      target_fat_g: null,
      goal: null,
      activity_level: null,
    });
  }, [upsert]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['nutritionProfile', userId] });
  }, [queryClient, userId]);

  return {
    profile: query.data?.profile ?? null,
    loading: query.isPending,
    error: query.data?.error ?? null,
    upsert,
    clearTarget,
    refresh,
  };
}
