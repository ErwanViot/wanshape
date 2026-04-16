import { ChevronRight, Utensils } from 'lucide-react';
import { Link } from 'react-router';
import { useDailyNutrition } from '../../hooks/useDailyNutrition.ts';
import { CalorieRing } from './CalorieRing.tsx';

/**
 * Home widget. Summarizes today's calorie intake + remaining-vs-target and
 * links to /nutrition. Hidden for visitors (no user → no fetch).
 */
export function NutritionWidget() {
  const { summary, loading } = useDailyNutrition();

  return (
    <Link
      to="/nutrition"
      className="flex items-center gap-4 rounded-2xl border border-card-border bg-surface-card px-5 py-4 group hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10 transition-all"
      aria-label="Suivi nutritionnel du jour"
    >
      <div className="shrink-0">
        {loading ? (
          <div className="w-20 h-20 rounded-full skeleton" />
        ) : (
          <CalorieRing current={summary.totals.calories} target={summary.target.calories} size={80} strokeWidth={8} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Utensils className="w-4 h-4 text-brand" aria-hidden="true" />
          <h3 className="font-display text-base font-bold text-heading">Nutrition du jour</h3>
        </div>
        {summary.target.calories != null ? (
          <p className="text-sm text-body">
            {Math.round(summary.totals.calories)} kcal consommés — cible {summary.target.calories} kcal
          </p>
        ) : (
          <p className="text-sm text-body">{Math.round(summary.totals.calories)} kcal consommés aujourd'hui</p>
        )}
        <p className="text-xs text-muted mt-1">Ajouter un repas →</p>
      </div>
      <ChevronRight
        className="w-5 h-5 text-muted shrink-0 group-hover:text-brand transition-colors"
        aria-hidden="true"
      />
    </Link>
  );
}
