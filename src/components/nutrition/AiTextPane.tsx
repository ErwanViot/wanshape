import { Sparkles } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useEstimateNutrition } from '../../hooks/useEstimateNutrition.ts';
import type { MealLogInsert, MealType, TextEstimate } from '../../types/nutrition.ts';

interface AiTextPaneProps {
  mealType: MealType;
  onSubmit: (input: Omit<MealLogInsert, 'user_id' | 'logged_date'>) => Promise<boolean>;
  onCancel: () => void;
}

const CONFIDENCE_LABEL: Record<TextEstimate['confidence'], string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
};

export function AiTextPane({ mealType, onSubmit, onCancel }: AiTextPaneProps) {
  const { estimateFromText, loading, error, reset } = useEstimateNutrition();
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState<TextEstimate | null>(null);
  const [aiUsage, setAiUsage] = useState<{ model: string; input: number | null; output: number | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEstimate(e: FormEvent) {
    e.preventDefault();
    reset();
    setEstimate(null);
    const trimmed = description.trim();
    if (trimmed.length < 3) return;
    const { data } = await estimateFromText(trimmed);
    if (data) {
      setEstimate(data.estimate);
      setAiUsage({ model: data.usage.model, input: data.usage.input_tokens, output: data.usage.output_tokens });
    }
  }

  async function handleConfirm() {
    if (!estimate || !aiUsage) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({
        meal_type: mealType,
        source: 'ai_text',
        // Server enforces <= 120, keep the client slice aligned.
        name: estimate.name.slice(0, 120),
        calories: estimate.calories,
        protein_g: estimate.protein_g,
        carbs_g: estimate.carbs_g,
        fat_g: estimate.fat_g,
        quantity_grams: null,
        reference_id: null,
        ai_metadata: {
          model: aiUsage.model,
          input_tokens: aiUsage.input ?? 0,
          output_tokens: aiUsage.output ?? 0,
          confidence: estimate.confidence,
        },
        notes: description.trim().slice(0, 500),
      });
      if (ok) onCancel();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand" aria-hidden="true" />
        <h3 className="font-display text-base font-bold text-heading">Estimation IA</h3>
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent/80 bg-accent/10 px-2 py-0.5 rounded-full">
          Premium
        </span>
      </div>

      <form onSubmit={handleEstimate} className="space-y-3">
        <div>
          <label htmlFor="ai-description" className="block text-xs font-medium text-body mb-1">
            Décris ton repas en quelques mots
          </label>
          <textarea
            id="ai-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Ex. pâtes bolognaise maison, 300 g, avec 20 g parmesan"
            className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading placeholder:text-muted focus:outline-none focus:border-brand"
          />
          <p className="text-[11px] text-muted mt-1">
            L'estimation est indicative (±20%). L'heure d'envoi et la description sont transmises à Anthropic pour le
            traitement.
          </p>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || description.trim().length < 3}
          className="w-full py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Estimation…' : "Demander à l'IA"}
        </button>
      </form>

      {estimate && (
        <div className="rounded-xl bg-surface-card border border-brand/30 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-heading font-medium">{estimate.name}</p>
            <span className="text-[10px] uppercase tracking-wider text-muted shrink-0">
              Confiance : {CONFIDENCE_LABEL[estimate.confidence]}
            </span>
          </div>
          <p className="font-display text-2xl font-black text-brand">{Math.round(estimate.calories)} kcal</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {estimate.protein_g != null && <span>{Math.round(estimate.protein_g)} g protéines</span>}
            {estimate.carbs_g != null && <span>{Math.round(estimate.carbs_g)} g glucides</span>}
            {estimate.fat_g != null && <span>{Math.round(estimate.fat_g)} g lipides</span>}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50"
            >
              {submitting ? 'Ajout…' : 'Confirmer et ajouter'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
