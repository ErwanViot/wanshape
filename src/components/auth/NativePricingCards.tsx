import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { usePurchases } from '../../hooks/usePurchases.ts';
import { useSubscription } from '../../hooks/useSubscription.ts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Native iOS / Android paywall — replaces the web Stripe paywall in
// PricingCards / PremiumPromoPage when running inside the Capacitor shell.
//
// Why a separate component: the web flow opens Stripe Checkout in a redirect.
// The native flow opens StoreKit (iOS) or Google Play Billing (Android) via
// RevenueCat's `purchasePackage()`. Different state machine, different errors,
// different UI affordances ("Restaurer mes achats" only makes sense on
// native). Trying to fork PricingCards on `isNative()` would have produced
// a 600-line component impossible to test independently — this one is ~180.
export function NativePricingCards() {
  const { t } = useTranslation('marketing');
  const { isPremium } = useSubscription();
  const { refreshProfile } = useAuth();
  const { packages, loading, error, purchase, restore } = usePurchases();

  // Latest premium flag readable inside async callbacks without re-subscribing.
  const premiumRef = useRef(isPremium);
  premiumRef.current = isPremium;

  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [activating, setActivating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (isPremium) {
    return (
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="rounded-2xl border-2 border-accent bg-surface-card p-6 flex flex-col items-center text-center gap-3">
          <Crown className="w-10 h-10 text-accent" aria-hidden="true" />
          <h3 className="font-display text-lg font-bold text-heading">
            {t('pricing_cards.active_premium_title', { defaultValue: 'Tu es Premium' })}
          </h3>
          <p className="text-sm text-subtle">
            {t('native_pricing.active_premium_body', {
              defaultValue:
                "Tout le contenu Premium est débloqué dans l'app. Gère ton abonnement depuis les Réglages de ton iPhone (Réglages > Apple ID > Abonnements).",
            })}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-6 py-12">
        <Loader2 className="w-6 h-6 text-brand animate-spin" aria-hidden="true" />
        <p className="text-sm text-subtle">
          {t('native_pricing.loading', { defaultValue: 'Chargement des abonnements…' })}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-3">
          <p className="text-sm text-strong">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
          >
            {t('native_pricing.retry', { defaultValue: 'Réessayer' })}
          </button>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center space-y-3">
          <p className="text-sm text-subtle">
            {t('native_pricing.unavailable', {
              defaultValue:
                "Les abonnements ne sont pas disponibles pour l'instant. Réessaie dans quelques minutes ou contacte le support.",
            })}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
          >
            {t('native_pricing.retry', { defaultValue: 'Réessayer' })}
          </button>
        </div>
      </div>
    );
  }

  // Sort: annual first (encourages the better-value option), then monthly.
  const sorted = [...packages].sort((a, b) => {
    const order = (id: string) => (id.includes('annual') || id.includes('yearly') ? 0 : id.includes('monthly') ? 1 : 2);
    return order(a.identifier) - order(b.identifier);
  });

  const handlePurchase = async (pkgId: string) => {
    const pkg = sorted.find((p) => p.identifier === pkgId);
    if (!pkg) return;
    setPurchasing(pkgId);
    setFeedback(null);
    const ok = await purchase(pkg);
    setPurchasing(null);
    if (ok) {
      // The StoreKit entitlement is active immediately, but the app's premium
      // state is sourced from Supabase `profiles.subscription_tier`, which the
      // revenuecat-webhook flips asynchronously (a few seconds). Poll the
      // profile until it lands so the UI unlocks without an app restart.
      setActivating(true);
      for (let i = 0; i < 12 && !premiumRef.current; i++) {
        await refreshProfile();
        if (premiumRef.current) break;
        await sleep(2000);
      }
      setActivating(false);
      // Only claim success once premium has actually landed. If the webhook is
      // slow (> ~24s) the entitlement is still valid but the tier hasn't synced
      // yet — tell the truth rather than a premature "Premium activé".
      setFeedback(
        premiumRef.current
          ? t('native_pricing.purchase_success', {
              defaultValue: 'Premium activé ! Toutes les fonctionnalités sont débloquées.',
            })
          : t('native_pricing.activation_delayed', {
              defaultValue:
                "Achat confirmé. L'activation Premium peut prendre un instant — relance l'app si rien ne change.",
            }),
      );
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setFeedback(null);
    const ok = await restore();
    setRestoring(false);
    setFeedback(
      ok
        ? t('native_pricing.restore_success', {
            defaultValue: 'Achat restauré. Premium réactivé.',
          })
        : t('native_pricing.restore_empty', {
            defaultValue: 'Aucun achat à restaurer pour ce compte Apple/Google.',
          }),
    );
  };

  const processing = purchasing !== null || restoring || activating;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      {processing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm px-6 text-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" aria-hidden="true" />
          <p className="text-sm font-medium text-white">
            {activating
              ? t('native_pricing.activating', { defaultValue: 'Activation de ton abonnement…' })
              : restoring
                ? t('native_pricing.restoring', { defaultValue: 'Restauration en cours…' })
                : t('native_pricing.processing', { defaultValue: 'Traitement en cours…' })}
          </p>
        </div>
      )}
      <header className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand/10">
          <Sparkles className="w-7 h-7 text-brand" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold text-heading">
          {t('native_pricing.title', { defaultValue: 'Passe à Premium' })}
        </h1>
        <p className="text-sm text-subtle">
          {t('native_pricing.subtitle', {
            defaultValue: 'Programmes IA illimités, séances personnalisées, suivi nutrition complet.',
          })}
        </p>
      </header>

      <div className="space-y-3">
        {sorted.map((pkg) => {
          const isAnnual = pkg.identifier.includes('annual') || pkg.identifier.includes('yearly');
          const isPurchasingThis = purchasing === pkg.identifier;
          return (
            <button
              key={pkg.identifier}
              type="button"
              onClick={() => handlePurchase(pkg.identifier)}
              disabled={purchasing !== null}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-colors disabled:opacity-60 ${
                isAnnual
                  ? 'border-brand bg-brand/5 hover:bg-brand/10'
                  : 'border-card-border bg-surface-card hover:border-brand/30'
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <h3 className="font-display font-bold text-heading">
                  {isAnnual
                    ? t('native_pricing.plan_yearly', { defaultValue: 'Premium Annuel' })
                    : t('native_pricing.plan_monthly', { defaultValue: 'Premium Mensuel' })}
                </h3>
                <span className="text-xl font-black text-heading">{pkg.product.priceString}</span>
              </div>
              {isAnnual && (
                <p className="text-xs text-brand font-semibold mb-2">
                  {t('native_pricing.yearly_savings', { defaultValue: 'Économise ~17% vs mensuel' })}
                </p>
              )}
              <ul className="space-y-1 text-xs text-subtle">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-brand shrink-0" aria-hidden="true" />
                  {t('native_pricing.feature_ai', {
                    defaultValue: 'Programmes & séances IA illimités',
                  })}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-brand shrink-0" aria-hidden="true" />
                  {t('native_pricing.feature_nutrition', {
                    defaultValue: 'Suivi nutrition complet + analyse IA',
                  })}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-brand shrink-0" aria-hidden="true" />
                  {t('native_pricing.feature_no_ads', {
                    defaultValue: 'Sans publicité, sans engagement',
                  })}
                </li>
              </ul>
              {isPurchasingThis && (
                <p className="text-xs text-muted mt-3">
                  {t('native_pricing.opening_store', { defaultValue: 'Ouverture de la boutique…' })}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <output
          aria-live="polite"
          className="block rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-strong text-center"
        >
          {feedback}
        </output>
      )}

      <div className="text-center space-y-3 pt-4 border-t border-divider">
        <button
          type="button"
          onClick={handleRestore}
          disabled={processing}
          className="text-sm text-link underline disabled:opacity-60"
        >
          {restoring
            ? t('native_pricing.restoring', { defaultValue: 'Restauration en cours…' })
            : t('native_pricing.restore_cta', { defaultValue: 'Restaurer mes achats' })}
        </button>
        <p className="text-xs text-faint leading-relaxed max-w-md mx-auto">
          {t('native_pricing.legal_note', {
            defaultValue:
              'Abonnement renouvelé automatiquement. Tu peux annuler à tout moment depuis les Réglages de ton iPhone (Réglages > Apple ID > Abonnements) au moins 24h avant la fin de la période en cours.',
          })}
        </p>
      </div>
    </div>
  );
}
