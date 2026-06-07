import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePurchases } from '../../hooks/usePurchases.ts';
import { isNative } from '../../lib/capacitor.ts';

// Restore Purchases button — required by Apple App Review (Guideline 3.1.1)
// for any app that sells non-consumable IAPs or auto-renewable subscriptions.
// Renders nothing on web (Stripe checkouts have no "restore" concept —
// the user just signs in to recover their state).
export function RestorePurchasesButton() {
  const { t } = useTranslation('common');
  const { restore } = usePurchases();
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isNative()) return null;

  const handleClick = async () => {
    setWorking(true);
    setFeedback(null);
    const ok = await restore();
    setWorking(false);
    setFeedback(
      ok
        ? t('restore_purchases.success', {
            defaultValue: 'Achat restauré. Premium réactivé.',
          })
        : t('restore_purchases.empty', {
            defaultValue: 'Aucun achat à restaurer sur ce compte Apple/Google.',
          }),
    );
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={working}
        className="w-full py-2.5 rounded-xl border border-divider text-sm font-medium text-strong hover:bg-divider transition-colors disabled:opacity-60"
      >
        {working
          ? t('restore_purchases.working', { defaultValue: 'Restauration en cours…' })
          : t('restore_purchases.cta', { defaultValue: 'Restaurer mes achats' })}
      </button>
      {feedback && (
        <output aria-live="polite" className="block text-xs text-muted text-center">
          {feedback}
        </output>
      )}
    </div>
  );
}
