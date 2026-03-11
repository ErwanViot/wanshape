import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSubscription } from '../hooks/useSubscription.ts';
import { formatDate } from '../utils/date.ts';

const PRICE_IDS = {
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY as string | undefined,
  yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY as string | undefined,
};

const FREE_FEATURES = [
  'Séance du jour guidée',
  '8 formats d\'entraînement',
  'Bibliothèque d\'exercices',
  '3 programmes guidés',
  'Historique complet',
  'Statistiques & suivi',
];

const PREMIUM_FEATURES = [
  'Tout le contenu gratuit',
  'Séances IA sur-mesure',
  'Programmes IA personnalisés',
  'Progression adaptée à ton niveau',
];

export function PricingCards() {
  const { user } = useAuth();
  const { isPremium, subscription, checkout, manageSubscription } = useSubscription();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    const priceId = PRICE_IDS[billing];
    if (!priceId) {
      setError('Configuration de prix manquante');
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      await checkout(priceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    try {
      await manageSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <div>
      {/* Billing toggle */}
      {!isPremium && (
        <div className="flex items-center justify-center gap-3 mb-10" role="radiogroup" aria-label="Fréquence de facturation">
          <button
            type="button"
            role="radio"
            aria-checked={billing === 'monthly'}
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              billing === 'monthly'
                ? 'bg-brand/10 text-brand'
                : 'text-muted hover:text-heading'
            }`}
          >
            Mensuel
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={billing === 'yearly'}
            onClick={() => setBilling('yearly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              billing === 'yearly'
                ? 'bg-brand/10 text-brand'
                : 'text-muted hover:text-heading'
            }`}
          >
            Annuel
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="rounded-2xl border border-card-border bg-surface-card p-6 flex flex-col">
          <h3 className="font-display text-lg font-bold text-heading mb-1">Gratuit</h3>
          <p className="text-3xl font-black text-heading mb-1">0 €</p>
          <p className="text-xs text-muted mb-6">Pour toujours</p>
          <ul className="space-y-3 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-body">{f}</span>
              </li>
            ))}
          </ul>
          {!user ? (
            <Link
              to="/signup"
              className="mt-6 flex items-center justify-center py-3 rounded-xl border border-divider-strong text-sm font-bold text-heading hover:bg-divider transition-colors"
            >
              Commencer gratuitement
            </Link>
          ) : (
            <div className="mt-6 flex items-center justify-center py-3 rounded-xl border border-divider text-sm font-medium text-muted">
              {isPremium ? 'Inclus dans Premium' : 'Plan actuel'}
            </div>
          )}
        </div>

        {/* Premium */}
        <div className="rounded-2xl border-2 border-accent bg-surface-card p-6 flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-3 py-1 rounded-full">
              Recommandé
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-accent" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-heading">Premium</h3>
          </div>

          {isPremium ? (
            <>
              <p className="text-3xl font-black text-heading mb-1">Actif</p>
              <p className="text-xs text-muted mb-6">
                {subscription?.cancel_at_period_end
                  ? `Se termine le ${formatDate(subscription.current_period_end)}`
                  : subscription?.current_period_end
                    ? `Prochain renouvellement le ${formatDate(subscription.current_period_end)}`
                    : 'Abonnement actif'}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-black text-heading mb-1">
                {billing === 'monthly' ? '9,99 €' : '99,99 €'}
                <span className="text-base font-medium text-muted">
                  /{billing === 'monthly' ? 'mois' : 'an'}
                </span>
              </p>
              <p className="text-xs text-muted mb-6">
                {billing === 'yearly' ? 'Soit 8,33 €/mois — 2 mois offerts' : 'Sans engagement'}
              </p>
            </>
          )}

          <ul className="space-y-3 flex-1">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-body">{f}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-4 text-xs text-red-400 text-center">{error}</p>
          )}

          {isPremium ? (
            <button
              type="button"
              onClick={handleManage}
              className="mt-6 flex items-center justify-center py-3 rounded-xl border border-accent/30 text-sm font-bold text-accent hover:bg-accent/10 transition-colors cursor-pointer"
            >
              Gérer mon abonnement
            </button>
          ) : user ? (
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Passer Premium
                </>
              )}
            </button>
          ) : (
            <Link
              to="/signup"
              className="mt-6 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Créer un compte
            </Link>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="mt-10 text-center text-xs text-muted space-y-1">
        <p>Prix TTC. TVA 20% incluse. Paiement sécurisé par Stripe.</p>
        <p>Annulation possible à tout moment depuis votre espace client. Accès maintenu jusqu'à la fin de la période payée.</p>
      </div>
    </div>
  );
}
