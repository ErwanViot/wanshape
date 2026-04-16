import { useCallback, useEffect, useState } from 'react';
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
  const { user, dataGeneration } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<NutritionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localGeneration, setLocalGeneration] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: dataGeneration + localGeneration force re-fetch
  useEffect(() => {
    if (!userId || !supabase) {
      setProfile(null);
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
          supabase!.from('nutrition_profiles').select('*').eq('user_id', userId).maybeSingle(),
        );
        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (err) {
          setError(err.message ?? 'Erreur de chargement du profil');
          setLoading(false);
          return;
        }
        setProfile((data as NutritionProfile | null) ?? null);
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
  }, [userId, dataGeneration, localGeneration]);

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
        setError(err.message ?? 'Erreur de sauvegarde');
        return null;
      }
      const next = data as NutritionProfile | null;
      setProfile(next);
      return next;
    },
    [userId],
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
    setLocalGeneration((g) => g + 1);
  }, []);

  return { profile, loading, error, upsert, clearTarget, refresh };
}
