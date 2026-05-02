import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { supabase } from '../lib/supabase.ts';
import type { Recipe, RecipeCategory, RecipeLocale } from '../types/recipe.ts';
import { getRecipeLocaleFromPath } from '../utils/localePath.ts';
import { pickRecipeByCategory } from '../utils/pickRecipe.ts';

export interface RecipesFilters {
  category?: RecipeCategory | null;
  tags?: string[];
  search?: string;
}

export interface UseRecipesResult {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

/**
 * Public listing — no auth required (recipes RLS allows anon SELECT when
 * is_published = TRUE). Filters apply on the result set client-side because
 * the catalogue is small (≤ 100 rows per locale) and avoids index-juggling
 * on every filter combo.
 *
 * Locale is derived from the URL (`/en/...` ⇒ en, otherwise fr) rather than
 * `i18n.language` so the rendered locale matches the indexed URL. The user's
 * preference toggle in /parametres switches the URL itself.
 */
export function useRecipes(filters: RecipesFilters = {}): UseRecipesResult {
  const { pathname } = useLocation();
  const locale: RecipeLocale = getRecipeLocaleFromPath(pathname);

  const query = useQuery<{ recipes: Recipe[]; error: string | null }>({
    queryKey: ['recipes', locale],
    queryFn: async () => {
      if (!supabase) return { recipes: [], error: null };
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('locale', locale)
        .eq('is_published', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) return { recipes: [], error: error.message };
      return { recipes: (data ?? []) as Recipe[], error: null };
    },
    // Recipes are editorial content with infrequent changes; a longer staleTime
    // keeps category/tag flips snappy without spamming Supabase.
    staleTime: 10 * 60 * 1000,
  });

  const all = query.data?.recipes ?? [];
  const filtered = applyFilters(all, filters);

  return {
    recipes: filtered,
    loading: query.isPending,
    // Distinguish a Supabase-returned error (in `data.error`) from an
    // un-caught network failure (React Query's `query.error`). Without this,
    // a connectivity blip looked like an empty catalogue.
    error: query.data?.error ?? (query.isError ? String(query.error ?? '') : null),
  };
}

export function applyFilters(recipes: Recipe[], filters: RecipesFilters): Recipe[] {
  let out = recipes;
  if (filters.category) out = out.filter((r) => r.category === filters.category);
  if (filters.tags?.length) {
    const wanted = filters.tags;
    out = out.filter((r) => wanted.every((t) => r.tags.includes(t)));
  }
  if (filters.search?.trim()) {
    const needle = filters.search.trim().toLowerCase();
    out = out.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle) ||
        r.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }
  return out;
}

/**
 * Locale comes from the URL (`/en/...` is en, anything else is fr). This way
 * a deep-linked French slug under `/nutrition/recettes/...` keeps querying
 * FR rows even if the user has set their UI preference to English.
 */
export function useRecipe(slug: string | undefined): {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
} {
  const { pathname } = useLocation();
  const locale: RecipeLocale = getRecipeLocaleFromPath(pathname);

  const query = useQuery<{ recipe: Recipe | null; error: string | null }>({
    queryKey: ['recipe', locale, slug ?? null],
    queryFn: async () => {
      if (!supabase || !slug) return { recipe: null, error: null };
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('locale', locale)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) return { recipe: null, error: error.message };
      return { recipe: (data as Recipe) ?? null, error: null };
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

  return {
    recipe: query.data?.recipe ?? null,
    loading: query.isPending,
    error: query.data?.error ?? (query.isError ? String(query.error ?? '') : null),
  };
}

/**
 * Returns one recipe deterministically picked from the visible catalogue
 * whose category matches `categories`. Reuses the cached `useRecipes` query
 * so this hook costs zero extra fetches when the catalogue is already
 * loaded. The `seed` argument keeps the picked recipe stable across renders
 * (e.g. on EndScreen, the suggestion shouldn't shuffle on every state flip).
 */
export function useRecipeSuggestion(
  categories: readonly RecipeCategory[],
  seed: string,
): { recipe: Recipe | null; loading: boolean } {
  const { recipes, loading } = useRecipes();
  const recipe = pickRecipeByCategory(recipes, categories, seed);
  return { recipe, loading };
}
