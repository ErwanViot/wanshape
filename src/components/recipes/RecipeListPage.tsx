import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useRecipes } from '../../hooks/useRecipes.ts';
import type { RecipeCategory } from '../../types/recipe.ts';
import { RecipeCard } from './RecipeCard.tsx';
import { RecipeFilters } from './RecipeFilters.tsx';

export function RecipeListPage() {
  const { t } = useTranslation('recipes');
  useDocumentHead({
    title: t('list.title'),
    description: t('list.description'),
  });

  const [category, setCategory] = useState<RecipeCategory | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Pull the unfiltered list once to drive both the result set AND the
  // available-tags chip cloud — this way filtering doesn't shrink the chip
  // options as the user narrows the result set.
  const { recipes: allRecipes } = useRecipes();
  const { recipes, loading, error } = useRecipes({
    category,
    tags: selectedTags,
    search,
  });

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    for (const r of allRecipes) for (const t of r.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allRecipes]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function reset() {
    setCategory(null);
    setSearch('');
    setSelectedTags([]);
  }

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-black text-heading">{t('list.heading')}</h1>
          <p className="text-sm text-muted">{t('list.subtitle')}</p>
        </header>

        <RecipeFilters
          category={category}
          search={search}
          availableTags={availableTags}
          selectedTags={selectedTags}
          onCategoryChange={setCategory}
          onSearchChange={setSearch}
          onTagToggle={toggleTag}
          onReset={reset}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`recipe-skel-${i}`} className="skeleton h-44 rounded-2xl" />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <p className="text-center text-sm text-muted py-12">{t('list.empty')}</p>
        ) : (
          <>
            <p className="text-xs text-muted">{t('list.count', { n: recipes.length })}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((r) => (
                <RecipeCard key={`${r.locale}-${r.recipe_key}`} recipe={r} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
