import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useOpenFoodFacts } from '../../hooks/useOpenFoodFacts.ts';
import type { OpenFoodFactsProduct } from '../../lib/openFoodFacts.ts';
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

export function BarcodePane({ mealType, onSubmit, onCancel }: BarcodePaneProps) {
  const { t } = useTranslation('nutrition');
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
          {t('barcode_pane.meal_label')} <span className="text-body font-medium">{t(`meal_type.${mealType}`)}</span>
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setShowScanner(true);
          }}
          className="text-xs text-brand hover:underline"
        >
          {t('barcode_pane.scan_another')}
        </button>
      </div>

      {loading && <p className="text-sm text-body">{t('barcode_pane.searching')}</p>}

      {error && (
        <p className="text-sm text-red-400">
          {error === 'invalid_barcode'
            ? t('barcode_pane.error_invalid_barcode')
            : error === 'not_found'
              ? t('barcode_pane.error_not_found')
              : error === 'missing_nutrition'
                ? t('barcode_pane.error_missing_nutrition')
                : error === 'network'
                  ? t('barcode_pane.error_network')
                  : t('barcode_pane.error_unknown')}
        </p>
      )}

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
                  : t('barcode_pane.kcal_missing')}
                {product.quantity ? ` · ${product.quantity}` : ''}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="barcode-portion" className="block text-xs font-medium text-body mb-1">
              {t('barcode_pane.quantity_label')}
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
            <Trans
              i18nKey="barcode_pane.portion_text"
              ns="nutrition"
              values={{
                kcal: Math.round(scaleKcal(product.calories_100g, Number.parseFloat(portionGrams) || 0)),
              }}
              components={{ strong: <strong /> }}
            />
          </p>

          {formError && <p className="text-xs text-red-400">{formError}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-body border border-divider hover:bg-divider transition-colors"
            >
              {t('barcode_pane.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cta-gradient disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? t('barcode_pane.adding') : t('barcode_pane.add')}
            </button>
          </div>

          <p className="text-[11px] text-muted italic">
            {t('barcode_pane.source_credit_prefix')}{' '}
            <a href={product.source_url} target="_blank" rel="noreferrer noopener" className="underline">
              Open Food Facts
            </a>{' '}
            {t('barcode_pane.source_credit_suffix')}
          </p>
        </form>
      )}
    </div>
  );
}
