import { Search } from 'lucide-react';
import { useState } from 'react';
import { useFoodSearch } from '../../hooks/useFoodSearch.ts';
import type { FoodReference } from '../../types/nutrition.ts';

interface FoodSearchInputProps {
  onSelect: (food: FoodReference) => void;
  placeholder?: string;
}

export function FoodSearchInput({ onSelect, placeholder }: FoodSearchInputProps) {
  const [query, setQuery] = useState('');
  const { results, loading } = useFoodSearch(query);

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">Rechercher un aliment</span>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? 'Pomme, pâtes cuites, yaourt…'}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
          autoComplete="off"
        />
      </label>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-xs text-muted">Tape au moins 2 caractères.</p>
      )}

      {query.trim().length >= 2 && (
        <div className="rounded-xl bg-surface-card border border-divider max-h-72 overflow-y-auto">
          {loading && results.length === 0 ? (
            <p className="p-3 text-sm text-muted">Recherche…</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-muted">Aucun résultat dans la base CIQUAL.</p>
          ) : (
            <ul>
              {results.map((food) => (
                <li key={food.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(food)}
                    className="w-full text-left px-3 py-2 hover:bg-divider transition-colors border-b border-divider last:border-b-0"
                  >
                    <p className="text-sm text-heading truncate">{food.name_fr}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {food.calories_100g != null
                        ? `${Math.round(food.calories_100g)} kcal / 100 g`
                        : 'Calories non disponibles'}
                      {food.group_fr && <span className="ml-2">· {food.group_fr}</span>}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
