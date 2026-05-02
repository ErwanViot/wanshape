import type { RecipeLocale } from '../types/recipe.ts';

/**
 * Returns the locale of a Wan2Fit URL by inspecting the path prefix.
 *
 * - `/en/...` is the EN namespace
 * - everything else is the canonical FR namespace
 *
 * Used by recipe components so the locale rendered in the page is bound to
 * the URL the crawler indexed, not to the user's i18n preference. Without
 * this, switching the language toggle would mis-render a prerendered page.
 */
export function getRecipeLocaleFromPath(pathname: string): RecipeLocale {
  return pathname.startsWith('/en/') ? 'en' : 'fr';
}

/**
 * Builds the URL of the same recipe in the alternate locale, given the
 * current path's locale and the alternate slug. Returns null when there is
 * no alternate (single-locale recipe).
 */
export function recipeUrlForLocale(locale: RecipeLocale, slug: string): string {
  return locale === 'en' ? `/en/nutrition/recipes/${slug}` : `/nutrition/recettes/${slug}`;
}

export function recipeListingUrlForLocale(locale: RecipeLocale): string {
  return locale === 'en' ? '/en/nutrition/recipes' : '/nutrition/recettes';
}
