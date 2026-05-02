/**
 * URL-safe slug builder. Used by the recipe seed and any future content
 * insertions that derive a slug from a localised name.
 *
 * - Strips diacritics via NFD normalisation (é → e, à → a, ñ → n…)
 * - Lowercases, replaces every non-[a-z0-9] run by a single hyphen
 * - Trims leading/trailing hyphens
 *
 * The matching CHECK constraint on `recipes.slug` enforces this exact shape
 * server-side, so any drift in the algorithm fails fast at insert time.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
