import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFoodSearch } from '../../hooks/useFoodSearch.ts';
import type { FoodReference } from '../../types/nutrition.ts';

interface FoodSearchInputProps {
  onSelect: (food: FoodReference) => void;
  placeholder?: string;
}

export function FoodSearchInput({ onSelect, placeholder }: FoodSearchInputProps) {
  const { t } = useTranslation('nutrition');
  const [query, setQuery] = useState('');
  const { results, loading } = useFoodSearch(query);

  return (
    <div className="space-y-2">
      <label htmlFor="food-search-input" className="sr-only">
        {t('food_search.sr_label')}
      </label>
      <div className="relative block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="food-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? t('food_search.default_placeholder')}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
          autoComplete="off"
        />
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-muted">{t('food_search.min_chars')}</p>
      )}

      {query.trim().length >= 2 && (
        <div className="rounded-xl bg-surface-card border border-divider max-h-72 overflow-y-auto">
          {loading && results.length === 0 ? (
            <p className="p-3 text-sm text-muted">{t('food_search.searching')}</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted">{t('food_search.no_results')}</p>
          ) : (
            <ul>
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(food)}
                    className="w-full text-left px-3 py-2 hover:bg-divider transition-colors border-b border-divider last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      {food.image_url && (
                        <img
                          src={food.image_url}
                          alt=""
                          loading="lazy"
                          className="w-10 h-10 rounded-md object-cover bg-surface shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          {/* Drop `truncate` so multi-line names stay legible —
                              shrinking would only hide info we just paid an
                              edge-function call to fetch. */}
                          <p className="text-sm text-heading flex-1 leading-snug">{food.name_fr}</p>
                          {food.source === 'off' && (
                            // ODbL attribution requirement when surfacing OFF data.
                            <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand/10 text-brand shrink-0 whitespace-nowrap">
                              {t('food_search.off_badge')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          {food.calories_100g != null
                            ? t('food_search.kcal_per_100', { kcal: Math.round(food.calories_100g) })
                            : t('food_search.calories_unavailable')}
                          {food.group_fr && <span className="ml-2">· {food.group_fr}</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {results.some((r) => r.source === 'off') && (
        <p className="text-[11px] text-muted italic">{t('food_search.off_attribution')}</p>
      )}
    </div>
  );
}
