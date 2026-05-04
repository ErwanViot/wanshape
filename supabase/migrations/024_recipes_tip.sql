-- Recipes — optional free-form tip rendered on the detail page. Used today for
-- "lighter version" suggestions on calorie-heavy entries (≈ ≥ 500 kcal/serving)
-- but kept generic so future tips (variations, pairings, batch advice, storage)
-- can land in the same field. Locale-bound (one per (recipe_key, locale) row).
--
-- Nullable on purpose: most recipes don't need a tip and seed entries default
-- to NULL when the field is omitted from the JSON.

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS tip TEXT;

COMMENT ON COLUMN public.recipes.tip IS
  'Optional one-line tip (lighter variant, pairing, batch advice…). NULL when absent.';
