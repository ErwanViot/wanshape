import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase.ts';
import type { Recipe, RecipeCategory, RecipeLocale } from '../types/recipe.ts';

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

function detectLocale(language: string): RecipeLocale {
  return language?.startsWith('en') ? 'en' : 'fr';
}

/**
 * Public listing — no auth required (recipes RLS allows anon SELECT when
 * is_published = TRUE). Filters apply on the result set client-side because
 * the catalogue is small (≤ 100 rows per locale) and avoids index-juggling
 * on every filter combo.
 */
export function useRecipes(filters: RecipesFilters = {}): UseRecipesResult {
  const { i18n } = useTranslation();
  const locale = detectLocale(i18n.language);

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
 * Slug↔locale invariant: each (recipe_key, locale) row has its own slug.
 * If the user switches language while sitting on a FR slug, this hook will
 * legitimately return `recipe: null` because the EN row has a different slug.
 * Per-recipe URL rewrite/redirect on locale toggle lands in PR 5.
 */
export function useRecipe(slug: string | undefined): {
  recipe: Recipe | null;
  loading: boolean;
  error: string | null;
} {
  const { i18n } = useTranslation();
  const locale = detectLocale(i18n.language);

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
