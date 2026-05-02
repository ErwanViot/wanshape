import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useRecipes } from '../../hooks/useRecipes.ts';
import { JsonLd } from '../../lib/JsonLd.tsx';
import { breadcrumbJsonLd, SITE_URL } from '../../lib/jsonld.ts';
import type { RecipeCategory } from '../../types/recipe.ts';
import { getRecipeLocaleFromPath, recipeUrlForLocale } from '../../utils/localePath.ts';
import { RecipeCard } from './RecipeCard.tsx';
import { RecipeFilters } from './RecipeFilters.tsx';

export function RecipeListPage() {
  const { t } = useTranslation('recipes');
  const { pathname } = useLocation();
  const locale = getRecipeLocaleFromPath(pathname);
  useDocumentHead({
    title: t('list.title'),
    description: t('list.description'),
  });

  const [category, setCategory] = useState<RecipeCategory | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Two `useRecipes` calls — one unfiltered for the chip cloud, one filtered
  // for the result grid. Both share queryKey `['recipes', locale]`, so React
  // Query dedupes them into a single network fetch; only `applyFilters` runs
  // twice, which is negligible at ≤ 100 rows. If the queryKey ever grows to
  // include filters (e.g. server-side filtering), this would split into two
  // real fetches — revisit then.
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

  // ItemList schema for the listing helps Google understand the page structure
  // and surface individual recipes as separate results.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: recipes.slice(0, 30).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}${recipeUrlForLocale(locale, r.slug)}`,
      name: r.name,
    })),
  };
  const breadcrumbsJsonLd = breadcrumbJsonLd([
    { name: t('breadcrumb.home', { ns: 'common' }), url: '/' },
    { name: t('list.heading'), url: pathname },
  ]);

  return (
    <div className="px-6 md:px-10 lg:px-14 py-8">
      <JsonLd data={breadcrumbsJsonLd} />
      <JsonLd data={itemListJsonLd} />
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
            <p className="text-xs text-muted">{t('list.count', { count: recipes.length })}</p>
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
