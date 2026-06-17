import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { captureEvent } from '../lib/analytics.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import { computeToggledFavorites } from '../utils/recipeFavorites.ts';

export interface UseRecipeFavoritesResult {
  /** Set of recipe_keys the current user has favorited. Empty for visitors. */
  favoriteKeys: Set<string>;
  loading: boolean;
  error: string | null;
  /** Toggles a recipe's favourite state with optimistic update. No-op for visitors. */
  toggle: (recipeKey: string) => Promise<void>;
  /**
   * recipe_key currently flipping. Per-key so toggling one heart doesn't
   * disable every other heart on the page during the round-trip.
   */
  pendingKey: string | null;
}

/**
 * Public API for the heart-toggle UI on RecipeCard / RecipeDetailPage and the
 * "My favourites" section on the listing. Visitors get an empty set and a
 * no-op toggle — the toggle button is hidden upstream so this is defensive.
 */
export function useRecipeFavorites(): UseRecipeFavoritesResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const queryKey: readonly unknown[] = ['recipeFavorites', userId ?? null];

  interface FavoritesQueryData {
    keys: string[];
    error: string | null;
  }

  const query = useQuery<FavoritesQueryData>({
    queryKey: [...queryKey],
    queryFn: async () => {
      if (!supabase || !userId) return { keys: [], error: null };
      const { data, error, sessionExpired } = await supabaseQuery(() =>
        supabase!.from('recipe_favorites').select('recipe_key').eq('user_id', userId),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return { keys: [], error: null };
      }
      if (error) return { keys: [], error: error.message ?? 'unknown error' };
      return { keys: (data ?? []).map((row: { recipe_key: string }) => row.recipe_key), error: null };
    },
    enabled: !!userId && !!supabase,
    staleTime: 60 * 1000,
  });

  const favoriteKeys = new Set<string>(query.data?.keys ?? []);

  const mutation = useMutation<void, Error, string>({
    mutationFn: async (recipeKey: string) => {
      if (!supabase || !userId) return;
      const isFavorite = favoriteKeys.has(recipeKey);
      if (isFavorite) {
        const { error: err } = await supabase
          .from('recipe_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_key', recipeKey);
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await supabase
          .from('recipe_favorites')
          .insert({ user_id: userId, recipe_key: recipeKey });
        if (err) throw new Error(err.message);
      }
    },
    // Optimistic update — flip immediately, rollback on error.
    onMutate: async (recipeKey) => {
      await queryClient.cancelQueries({ queryKey: [...queryKey] });
      const previous = queryClient.getQueryData<FavoritesQueryData>([...queryKey]);
      const next = computeToggledFavorites(new Set(previous?.keys ?? []), recipeKey);
      queryClient.setQueryData<FavoritesQueryData>([...queryKey], { keys: Array.from(next), error: null });
      return { previous };
    },
    onError: (_err, _key, context) => {
      const ctx = context as { previous?: FavoritesQueryData } | undefined;
      if (ctx?.previous) queryClient.setQueryData<FavoritesQueryData>([...queryKey], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKey] });
    },
  });

  const toggle = useCallback(
    async (recipeKey: string) => {
      if (!userId) return;
      // Capture intent BEFORE the mutation flips the optimistic state
      // — onMutate runs synchronously inside mutateAsync, so reading
      // favoriteKeys after await would already be inverted.
      const wasFavorite = favoriteKeys.has(recipeKey);
      captureEvent(wasFavorite ? 'recipe_unfavorited' : 'recipe_favorited', { recipe_key: recipeKey });
      await mutation.mutateAsync(recipeKey).catch(() => {
        // Error is surfaced via React Query state; the optimistic rollback
        // already happened in `onError`.
      });
    },
    [userId, mutation, favoriteKeys],
  );

  return {
    favoriteKeys,
    loading: query.isPending && !!userId,
    error: query.data?.error ?? (query.isError ? String(query.error ?? '') : null),
    toggle,
    pendingKey: mutation.isPending ? (mutation.variables ?? null) : null,
  };
}
