import { useEffect, useState } from 'react';
import i18n from '../i18n/index.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { FoodReference } from '../types/nutrition.ts';

const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

const DEBOUNCE_MS = 200;
const RESULTS_LIMIT = 12;

export interface UseFoodSearchResult {
  results: FoodReference[];
  loading: boolean;
  error: string | null;
}

/**
 * Debounced fuzzy search over public.food_reference (CIQUAL).
 * Uses the `ilike` operator over the trigram-indexed `name_fr` column.
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
        setResults((data ?? []) as FoodReference[]);
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
      clearTimeout(timer);
    };
  }, [query]);

  return { results, loading, error };
}
