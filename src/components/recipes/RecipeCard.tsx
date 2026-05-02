import { Clock, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { Recipe } from '../../types/recipe.ts';
import { recipeUrlForLocale } from '../../utils/localePath.ts';
import { FavoriteButton } from './FavoriteButton.tsx';

export interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { t } = useTranslation('recipes');

  return (
    <Link
      to={recipeUrlForLocale(recipe.locale, recipe.slug)}
      className="group flex flex-col gap-3 rounded-2xl border border-card-border bg-surface-card p-5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 transition-all"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-brand">
          {t(`category.${recipe.category}`)}
        </span>
        <div className="flex items-center gap-2">
          {recipe.difficulty && <span className="text-[10px] text-muted">{t(`difficulty.${recipe.difficulty}`)}</span>}
          <FavoriteButton recipeKey={recipe.recipe_key} compact />
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-heading leading-tight group-hover:text-brand transition-colors">
        {recipe.name}
      </h3>
      <p className="text-sm text-body line-clamp-2">{recipe.description}</p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-3 border-t border-divider text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" aria-hidden="true" />
          {t('card.kcal', { n: recipe.nutrition.calories })}
        </span>
        {recipe.prep_time_min != null && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {t('card.prep_min', { n: recipe.prep_time_min })}
          </span>
        )}
      </div>
    </Link>
  );
}
