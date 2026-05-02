import { ArrowLeft, ChefHat, Clock, Flame, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router';
import { useDocumentHead } from '../../hooks/useDocumentHead.ts';
import { useRecipe } from '../../hooks/useRecipes.ts';
import { JsonLd } from '../../lib/JsonLd.tsx';
import { breadcrumbJsonLd, minutesToISODuration, recipeJsonLd } from '../../lib/jsonld.ts';
import { getRecipeLocaleFromPath, recipeListingUrlForLocale } from '../../utils/localePath.ts';

export function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation('recipes');
  const { pathname } = useLocation();
  const locale = getRecipeLocaleFromPath(pathname);
  const { recipe, loading, error } = useRecipe(slug);

  useDocumentHead({
    title: recipe ? `${recipe.name} · Wan2Fit` : t('detail.title_fallback'),
    description: recipe?.description ?? t('detail.description_fallback'),
  });

  const listingUrl = recipeListingUrlForLocale(locale);

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="skeleton h-8 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="px-6 md:px-10 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-heading">{t('detail.not_found_title')}</h1>
          <p className="text-sm text-muted">{error ?? t('detail.not_found_body')}</p>
          <Link to={listingUrl} className="inline-block text-sm text-brand hover:underline">
            {t('detail.back_to_list')}
          </Link>
        </div>
      </div>
    );
  }

  const macros = [
    { label: t('macro.calories'), value: recipe.nutrition.calories, unit: 'kcal' },
    { label: t('macro.protein'), value: recipe.nutrition.protein, unit: 'g' },
    { label: t('macro.carbs'), value: recipe.nutrition.carbs, unit: 'g' },
    { label: t('macro.fat'), value: recipe.nutrition.fat, unit: 'g' },
  ];

  // Schema.org Recipe payload — drives Google Rich Results and gives LLMs a
  // structured view of the recipe (ingredients, steps, nutrition).
  const recipeSchema = recipeJsonLd({
    name: recipe.name,
    description: recipe.description,
    url: pathname,
    inLanguage: locale === 'en' ? 'en-US' : 'fr-FR',
    recipeCategory: t(`category.${recipe.category}`),
    recipeYield: recipe.servings,
    totalTime: minutesToISODuration(recipe.prep_time_min ?? null),
    recipeIngredient: recipe.ingredients.map((ing) => `${ing.qty ? `${ing.qty} ` : ''}${ing.item}`.trim()),
    recipeInstructions: recipe.steps,
    nutrition: {
      calories: recipe.nutrition.calories,
      protein_g: recipe.nutrition.protein,
      carbs_g: recipe.nutrition.carbs,
      fat_g: recipe.nutrition.fat,
      fiber_g: recipe.nutrition.fiber,
      servings: recipe.servings,
    },
    keywords: recipe.tags,
  });
  const breadcrumbsSchema = breadcrumbJsonLd([
    { name: t('breadcrumb.home', { ns: 'common' }), url: '/' },
    { name: t('list.heading'), url: listingUrl },
    { name: recipe.name, url: pathname },
  ]);

  return (
    <article className="px-6 md:px-10 py-8">
      <JsonLd data={breadcrumbsSchema} />
      <JsonLd data={recipeSchema} />
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to={listingUrl}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-body transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {t('detail.back_to_list')}
        </Link>

        <header className="space-y-3">
          <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-brand">
            {t(`category.${recipe.category}`)}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-heading leading-tight">{recipe.name}</h1>
          <p className="text-base text-body">{recipe.description}</p>
        </header>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {recipe.prep_time_min != null && (
            <Stat
              icon={<Clock className="w-4 h-4" />}
              label={t('detail.prep_time')}
              value={t('card.prep_min', { n: recipe.prep_time_min })}
            />
          )}
          <Stat icon={<Users className="w-4 h-4" />} label={t('detail.servings')} value={String(recipe.servings)} />
          {recipe.difficulty && (
            <Stat
              icon={<ChefHat className="w-4 h-4" />}
              label={t('detail.difficulty')}
              value={t(`difficulty.${recipe.difficulty}`)}
            />
          )}
          <Stat
            icon={<Flame className="w-4 h-4" />}
            label={t('macro.calories')}
            value={`${recipe.nutrition.calories} kcal`}
          />
        </dl>

        <section className="rounded-2xl border border-card-border bg-surface-card p-5 space-y-3">
          <h2 className="font-display text-lg font-bold text-heading">{t('detail.nutrition_heading')}</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {macros.map((m) => (
              <div key={m.label}>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{m.label}</dt>
                <dd className="text-base font-bold text-heading">
                  {m.value}
                  <span className="text-xs text-muted font-normal"> {m.unit}</span>
                </dd>
              </div>
            ))}
            {recipe.nutrition.fiber != null && (
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{t('macro.fiber')}</dt>
                <dd className="text-base font-bold text-heading">
                  {recipe.nutrition.fiber}
                  <span className="text-xs text-muted font-normal"> g</span>
                </dd>
              </div>
            )}
          </dl>
          <p className="text-[11px] text-muted">{t('detail.nutrition_per_serving', { count: recipe.servings })}</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-heading">{t('detail.ingredients_heading')}</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={`ing-${i}-${ing.item}`}
                className="flex gap-3 rounded-xl bg-surface-card border border-divider px-4 py-2.5 text-sm text-body"
              >
                {ing.qty && <span className="font-medium text-heading shrink-0 min-w-[5rem]">{ing.qty}</span>}
                <span>{ing.item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-heading">{t('detail.steps_heading')}</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, i) => (
              <li key={`step-${i}`} className="flex gap-3">
                <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-brand/15 text-brand text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-body leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {recipe.tags.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted">{t('detail.tags_heading')}</h2>
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface border border-divider px-2.5 py-1 text-[11px] text-body"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-divider bg-surface px-3 py-2">
      <span className="text-muted shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted truncate">{label}</div>
        <div className="text-sm font-bold text-heading capitalize truncate">{value}</div>
      </div>
    </div>
  );
}
