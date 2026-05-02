import type { Recipe, RecipeCategory } from '../types/recipe.ts';

/**
 * Deterministically picks one recipe from `recipes` whose category is in
 * `categories`. Determinism (via `seed`) keeps the suggestion stable through
 * a render cycle so React Query rerenders don't shuffle the chosen recipe
 * mid-view.
 *
 * Returns null when no recipe matches — callers render nothing.
 */
export function pickRecipeByCategory(
  recipes: readonly Recipe[],
  categories: readonly RecipeCategory[],
  seed: string,
): Recipe | null {
  const set = new Set(categories);
  const eligible = recipes.filter((r) => set.has(r.category));
  if (eligible.length === 0) return null;
  const idx = stringToIndex(seed, eligible.length);
  return eligible[idx];
}

/** Tiny FNV-1a-style hash → bounded index. Stable, no crypto needed. */
function stringToIndex(input: string, modulo: number): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % modulo;
}
