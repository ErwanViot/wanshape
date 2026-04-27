import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useEstimateNutrition } from '../../hooks/useEstimateNutrition.ts';
import type { NutritionInsight } from '../../types/nutrition.ts';
import { todayYYYYMMDD } from '../../utils/nutritionDate.ts';

interface InsightCardProps {
  insight: NutritionInsight | null;
  isPremium: boolean;
  onGenerated: (next: NutritionInsight) => void;
}

/**
 * Card displayed on NutritionPage to surface the daily overflow insight.
 * For free users it shows a locked teaser. For premium users it either shows
 * the existing insight or a CTA to generate the 1-per-day analysis.
 */
export function InsightCard({ insight, isPremium, onGenerated }: InsightCardProps) {
  const { t } = useTranslation('nutrition');
  const { generateOverflowInsight, loading, reset } = useEstimateNutrition();
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleGenerate() {
    reset();
    setLocalError(null);
    // Always pass the client-local date so the server-side default (UTC today)
    // doesn't cross a timezone boundary for users far from UTC.
    const { data, error: callError } = await generateOverflowInsight(todayYYYYMMDD());
    if (data) {
      onGenerated(data.insight);
    } else if (callError) {
      setLocalError(callError);
    }
  }

  if (!isPremium) {
    return (
      <aside className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-heading">{t('insight.heading')}</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">
            {t('insight.premium_badge')}
          </span>
        </div>
        <p className="text-sm text-body mb-3">{t('insight.teaser')}</p>
        <Link
          to="/premium"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
        >
          {t('insight.discover_premium')}
        </Link>
      </aside>
    );
  }

  if (insight) {
    return (
      <aside className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/5 to-transparent p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-heading">{t('insight.heading')}</h2>
        </div>
        <p className="text-sm text-body leading-relaxed">{insight.summary}</p>
        {insight.suggestions.length > 0 && (
          <ul className="space-y-1.5">
            {insight.suggestions.map((s) => (
              <li key={s} className="text-sm text-body flex gap-2">
                <span className="text-brand" aria-hidden="true">
                  •
                </span>
                <span className="flex-1">{s}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-muted italic">{t('insight.disclaimer')}</p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-brand/30 bg-surface-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand" aria-hidden="true" />
        <h2 className="font-display text-base font-bold text-heading">{t('insight.heading')}</h2>
      </div>
      <p className="text-sm text-body">{t('insight.cta_desc')}</p>
      {localError && <p className="text-xs text-red-400">{localError}</p>}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
      >
        {loading ? t('insight.analyzing') : t('insight.generate_cta')}
      </button>
    </aside>
  );
}
