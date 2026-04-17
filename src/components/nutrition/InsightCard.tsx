import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useEstimateNutrition } from '../../hooks/useEstimateNutrition.ts';
import type { NutritionInsight } from '../../types/nutrition.ts';

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
  const { generateOverflowInsight, loading, error, reset } = useEstimateNutrition();
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleGenerate() {
    reset();
    setLocalError(null);
    const result = await generateOverflowInsight();
    if (result) {
      onGenerated(result.insight);
    } else if (error) {
      setLocalError(error);
    }
  }

  if (!isPremium) {
    return (
      <aside className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-heading">Analyse IA de ta journée</h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">
            Premium
          </span>
        </div>
        <p className="text-sm text-body mb-3">
          Une fois par jour, l'IA résume ton équilibre alimentaire et te propose 1 à 3 pistes concrètes pour le reste de
          la journée.
        </p>
        <Link
          to="/premium"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
        >
          Découvrir Premium
        </Link>
      </aside>
    );
  }

  if (insight) {
    return (
      <aside className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/5 to-transparent p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand" aria-hidden="true" />
          <h2 className="font-display text-base font-bold text-heading">Analyse IA de ta journée</h2>
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
        <p className="text-[11px] text-muted italic">
          Estimation non-médicale. Ajuste selon ton ressenti. Une seule analyse par jour.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-brand/30 bg-surface-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand" aria-hidden="true" />
        <h2 className="font-display text-base font-bold text-heading">Analyse IA de ta journée</h2>
      </div>
      <p className="text-sm text-body">
        Quand tu as saisi tes repas, demande un insight : synthèse en 1-3 phrases + pistes concrètes pour le reste de la
        journée.
      </p>
      {localError && <p className="text-xs text-red-400">{localError}</p>}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
      >
        {loading ? 'Analyse…' : 'Analyser ma journée'}
      </button>
    </aside>
  );
}
