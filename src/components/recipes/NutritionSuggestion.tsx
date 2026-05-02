import { ChefHat, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useRecipeSuggestion } from '../../hooks/useRecipes.ts';
import type { RecipeCategory } from '../../types/recipe.ts';
import { recipeUrlForLocale } from '../../utils/localePath.ts';

const POST_WORKOUT_CATEGORIES: RecipeCategory[] = ['post', 'recovery'];

export interface NutritionSuggestionProps {
  /** Stable seed so the suggestion doesn't shuffle on EndScreen rerenders. */
  seed: string;
}

/**
 * Discreet "pair this session with a recipe" CTA shown on EndScreen for
 * authenticated users. Suggests a single post-workout or recovery recipe.
 * Renders nothing while the catalogue is loading or empty — the CTA is
 * additive, never blocking.
 */
export function NutritionSuggestion({ seed }: NutritionSuggestionProps) {
  const { t, i18n } = useTranslation('recipes');
  const { recipe, loading } = useRecipeSuggestion(POST_WORKOUT_CATEGORIES, seed);

  if (loading || !recipe) return null;

  const locale = i18n.language?.startsWith('en') ? 'en' : 'fr';
  const href = recipeUrlForLocale(locale, recipe.slug);

  return (
    <Link
      to={href}
      className="w-full max-w-sm flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors"
    >
      <ChefHat className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/60">
          {t('nutrition_suggestion.label')}
        </p>
        <p className="text-sm font-semibold text-white truncate">{recipe.name}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-white/60 shrink-0" aria-hidden="true" />
    </Link>
  );
}
