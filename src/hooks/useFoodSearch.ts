import { useEffect, useState } from 'react';
import i18n from '../i18n/index.ts';
import { searchOpenFoodFactsProducts } from '../lib/openFoodFacts.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { FoodReference } from '../types/nutrition.ts';

const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

// 500 ms is the sweet spot for a text search that may chain into a remote
// edge function (OFF). 200 ms was too aggressive — fast typers hit the
// edge function on most keystrokes, even though only the last one mattered,
// pushing us toward OFF's 10 req/min/IP ceiling for nothing.
const DEBOUNCE_MS = 500;
const RESULTS_LIMIT = 12;
// CIQUAL covers ~3000 generic foods (apple, milk, bread); branded retail
// products (e.g. Desperados, Heineken, Activia) only live in OFF. When
// CIQUAL has zero hits, fall back to the public OFF text-search so the
// user doesn't dead-end. Capped to keep the result list digestible.
const OFF_FALLBACK_LIMIT = 8;

export interface UseFoodSearchResult {
  results: FoodReference[];
  loading: boolean;
  error: string | null;
}

/**
 * Debounced fuzzy search over public.food_reference (CIQUAL), with an
 * automatic Open Food Facts fallback when CIQUAL returns no results.
 */
export function useFoodSearch(query: string): UseFoodSearchResult {
  const [results, setResults] = useState<FoodReference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2 || !supabase) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Escape PostgreSQL LIKE wildcards so user-typed % or _ are treated as
    // literals. PostgREST has no parameterized escape for ilike patterns, so
    // we prepend a backslash to both special chars and use `\\` as the escape
    // character — still trigram-indexable for the surrounding `%...%` part.
    const escaped = trimmed.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');

    let cancelled = false;
    const offAbort = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const {
          data,
          error: err,
          sessionExpired,
        } = await supabaseQuery(() =>
          supabase!
            .from('food_reference')
            .select('*')
            .ilike('name_fr', `%${escaped}%`)
            .order('name_fr', { ascending: true })
            .limit(RESULTS_LIMIT),
        );
        if (cancelled) return;
        if (sessionExpired) {
          notifySessionExpired();
          setLoading(false);
          return;
        }
        if (err) {
          setError(err.message ?? tHookError('search_failed'));
          setLoading(false);
          return;
        }
        const ciqualRows = (data ?? []) as FoodReference[];

        if (ciqualRows.length > 0) {
          setResults(ciqualRows);
          setError(null);
          setLoading(false);
          return;
        }

        // CIQUAL miss → query OFF as a graceful fallback. Failures degrade
        // to "no results" rather than surfacing — the search still returned,
        // it just had nothing to offer.
        const offHits = await searchOpenFoodFactsProducts(trimmed, OFF_FALLBACK_LIMIT, offAbort.signal);
        if (cancelled) return;

        const mapped: FoodReference[] = offHits.map((p) => {
          // Avoid the redundant "Desperados (Desperados)" pattern that
          // OFF's data frequently produces — many products store the brand
          // verbatim in their product_name. Only append the brand when it
          // adds information.
          const brandIsRedundant = p.brand && p.name.toLowerCase().includes(p.brand.toLowerCase());
          return {
            id: p.barcode,
            name_fr: p.brand && !brandIsRedundant ? `${p.name} (${p.brand})` : p.name,
            group_fr: null,
            calories_100g: p.calories_100g,
            protein_100g: p.protein_100g,
            carbs_100g: p.carbs_100g,
            fat_100g: p.fat_100g,
            fiber_100g: p.fiber_100g,
            source: 'off',
            brand: p.brand,
            image_url: p.image_url,
            source_url: p.source_url,
            product_quantity_g: p.product_quantity_g,
            serving_quantity_g: p.serving_quantity_g,
          };
        });
        setResults(mapped);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : tHookError('unexpected'));
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      offAbort.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
}
