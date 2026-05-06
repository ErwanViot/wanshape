import type { SupportedLocale } from '../i18n';
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

// FR canonical ↔ EN-prefixed paths for pages whose URL itself is localised.
// Recipe detail slugs differ between locales (FR slug vs EN slug) so the
// pair is intentionally limited to the listing — switching language on a
// detail page falls back to the listing in the target locale (see twinPath).
const PATH_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['/decouvrir/seances', '/en/discover/sessions'],
  ['/decouvrir/programmes', '/en/discover/programs'],
  ['/decouvrir/nutrition', '/en/discover/nutrition'],
  ['/decouvrir/suivi', '/en/discover/tracking'],
  ['/nutrition/recettes', '/en/nutrition/recipes'],
];

/**
 * Returns the equivalent path in the target locale for pages whose URL is
 * itself localised (acquisition landings, recipe listing). Returns null
 * when the current page has no twin in the other locale — callers should
 * keep the current URL in that case.
 *
 * Detail recipe URLs (`/nutrition/recettes/<fr-slug>` vs
 * `/en/nutrition/recipes/<en-slug>`) cannot be mapped directly because
 * the slugs differ; the function falls back to the listing URL of the
 * target locale, which is the closest stable destination.
 */
export function twinPath(pathname: string, target: SupportedLocale): string | null {
  // Prefix checks must come before the exact-match loop: a path like
  // `/nutrition/recettes/<slug>` would otherwise fall through and return
  // null instead of falling back to the listing.
  if (target === 'en' && pathname.startsWith('/nutrition/recettes/')) return '/en/nutrition/recipes';
  if (target === 'fr' && pathname.startsWith('/en/nutrition/recipes/')) return '/nutrition/recettes';

  for (const [fr, en] of PATH_PAIRS) {
    if (target === 'en' && pathname === fr) return en;
    if (target === 'fr' && pathname === en) return fr;
  }
  return null;
}
