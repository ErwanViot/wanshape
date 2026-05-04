import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RecipeCategory } from '../../types/recipe.ts';

export interface RecipeFiltersProps {
  category: RecipeCategory | null;
  search: string;
  /** All tags found across the catalogue, already deduped & sorted. */
  availableTags: string[];
  selectedTags: string[];
  onCategoryChange: (next: RecipeCategory | null) => void;
  onSearchChange: (next: string) => void;
  onTagToggle: (tag: string) => void;
  onReset: () => void;
}

const CATEGORIES: RecipeCategory[] = ['pre', 'post', 'breakfast', 'recovery', 'snack', 'main', 'dessert', 'base'];

export function RecipeFilters({
  category,
  search,
  availableTags,
  selectedTags,
  onCategoryChange,
  onSearchChange,
  onTagToggle,
  onReset,
}: RecipeFiltersProps) {
  const { t } = useTranslation('recipes');
  const isActive = category != null || search.trim() !== '' || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filters.search_placeholder')}
          aria-label={t('filters.search_placeholder')}
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-divider bg-surface text-sm text-body placeholder:text-muted focus:outline-none focus:border-brand/50"
        />
      </label>

      <fieldset className="flex flex-wrap gap-2 border-0 p-0 m-0">
        <legend className="sr-only">{t('filters.category_aria')}</legend>
        <Chip active={category == null} onClick={() => onCategoryChange(null)}>
          {t('filters.category_all')}
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => onCategoryChange(category === c ? null : c)}>
            {t(`category.${c}`)}
          </Chip>
        ))}
      </fieldset>

      {availableTags.length > 0 && (
        <details className="group">
          <summary className="text-xs text-muted cursor-pointer select-none hover:text-body transition-colors">
            {t('filters.tags_toggle', { n: availableTags.length })}
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <Chip key={tag} active={selectedTags.includes(tag)} onClick={() => onTagToggle(tag)} small>
                {tag}
              </Chip>
            ))}
          </div>
        </details>
      )}

      {isActive && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-body transition-colors"
        >
          <X className="w-3 h-3" aria-hidden="true" />
          {t('filters.reset')}
        </button>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  small = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border transition-colors ${small ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} ${
        active
          ? 'bg-brand/15 border-brand/40 text-heading'
          : 'bg-surface border-divider text-body hover:border-brand/30'
      }`}
    >
      {children}
    </button>
  );
}
