import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useOpenFoodFacts } from '../../hooks/useOpenFoodFacts.ts';
import type { OpenFoodFactsProduct } from '../../lib/openFoodFacts.ts';
import { MEAL_TYPE_LABELS } from '../../config/nutrition.ts';
import type { MealType } from '../../types/nutrition.ts';
import { BarcodeScanner } from './BarcodeScanner.tsx';

interface BarcodePaneProps {
  mealType: MealType;
  onSubmit: (product: OpenFoodFactsProduct, quantityGrams: number) => Promise<boolean>;
  onCancel: () => void;
}

function scaleKcal(per100g: number | null, grams: number): number {
  if (per100g == null || grams <= 0) return 0;
  return Math.round(((per100g * grams) / 100) * 10) / 10;
}

const ERROR_LABELS: Record<string, string> = {
  invalid_barcode: 'Code-barres invalide. Utilise un EAN-8, EAN-13, UPC-A ou UPC-E.',
  not_found: "Ce produit n'est pas référencé sur Open Food Facts.",
  missing_nutrition: 'Ce produit est référencé mais ses données nutritionnelles sont incomplètes.',
  network: 'Impossible de contacter Open Food Facts. Vérifie ta connexion.',
};

export function BarcodePane({ mealType, onSubmit, onCancel }: BarcodePaneProps) {
  const { product, loading, error, fetchByBarcode, reset } = useOpenFoodFacts();
  const [showScanner, setShowScanner] = useState(true);
  const [portionGrams, setPortionGrams] = useState('100');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Cancel in-flight OFF fetch + clear state when the pane unmounts.
  useEffect(() => () => reset(), [reset]);

  const handleDetected = useCallback(
    (barcode: string) => {
      setShowScanner(false);
      fetchByBarcode(barcode);
    },
    [fetchByBarcode],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!product) return;
    const grams = Number.parseFloat(portionGrams.replace(',', '.'));
    if (!Number.isFinite(grams) || grams <= 0) {
      setFormError('La quantité doit être un nombre positif.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(product, grams);
    } finally {
      setSubmitting(false);
    }
  }

  if (showScanner) {
    return <BarcodeScanner onDetected={handleDetected} onClose={onCancel} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Repas : <span className="text-body font-medium">{MEAL_TYPE_LABELS[mealType]}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setShowScanner(true);
          }}
          className="text-xs text-brand hover:underline"
        >
          Scanner un autre
        </button>
      </div>

      {loading && <p className="text-sm text-body">Recherche sur Open Food Facts…</p>}

      {error && <p className="text-sm text-red-400">{ERROR_LABELS[error] ?? 'Erreur inconnue.'}</p>}

      {product && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-surface-card border border-divider p-3">
            {product.image_url && (
              <img
                src={product.image_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover bg-surface shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-heading font-medium truncate">{product.name}</p>
              {product.brand && <p className="text-xs text-muted">{product.brand}</p>}
              <p className="text-xs text-muted mt-1">
                {product.calories_100g != null
                  ? `${Math.round(product.calories_100g)} kcal / 100 g`
                  : 'kcal manquantes'}
                {product.quantity ? ` · ${product.quantity}` : ''}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="barcode-portion" className="block text-xs font-medium text-body mb-1">
              Quantité consommée (g)
            </label>
            <input
              id="barcode-portion"
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={portionGrams}
              onChange={(e) => setPortionGrams(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-divider text-sm text-heading focus:outline-none focus:border-brand"
            />
          </div>

          <p className="text-sm text-body">
            Soit{' '}
            <span className="font-bold text-brand">
              {Math.round(scaleKcal(product.calories_100g, Number.parseFloat(portionGrams) || 0))} kcal
            </span>{' '}
            pour cette portion.
          </p>

          {formError && <p className="text-xs text-red-400">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>

          <p className="text-[11px] text-muted italic">
            Données fournies via{' '}
            <a href={product.source_url} target="_blank" rel="noreferrer noopener" className="underline">
              Open Food Facts
            </a>{' '}
            (licence ODbL).
          </p>
        </form>
      )}
    </div>
  );
}
