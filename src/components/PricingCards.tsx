import { useState } from 'react';
import { Link } from 'react-router';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
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

const OFFER_DETAILS = [
  'Renouvellement automatique',
  'Résiliable à tout moment',
];

export function PricingCards() {
  const { user } = useAuth();
  const { isPremium, subscription, checkout, manageSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [acceptedCgv, setAcceptedCgv] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!acceptedCgv) {
      setError('Accepte les CGV pour continuer.');
      return;
    }
    const priceId = PRICE_IDS[selectedPlan];
    if (!priceId) {
      setError('Configuration de prix manquante');
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    const err = await checkout(priceId);
    if (err) {
      setError(err);
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    const err = await manageSubscription();
    if (err) setError(err);
  };

  // Already premium — simplified view
  if (isPremium) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-2xl border-2 border-accent bg-surface-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-accent" aria-hidden="true" />
            <h3 className="font-display text-lg font-bold text-heading">Premium</h3>
          </div>
          <p className="text-3xl font-black text-heading mb-1">Actif</p>
          <p className="text-xs text-muted mb-6">
            {subscription?.cancel_at_period_end
              ? `Se termine le ${formatDate(subscription.current_period_end)}`
              : subscription?.current_period_end
                ? `Prochain renouvellement le ${formatDate(subscription.current_period_end)}`
                : 'Abonnement actif'}
          </p>
          <ul className="space-y-3 flex-1">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-body">{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={handleManage}
            className="mt-6 flex items-center justify-center py-3 rounded-xl border border-accent/30 text-sm font-bold text-accent hover:bg-accent/10 transition-colors cursor-pointer"
          >
            Gérer mon abonnement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Plans — 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">

        {/* Free — reference */}
        <div className="rounded-2xl border border-card-border bg-surface-card p-6 flex flex-col">
          <h3 className="font-display text-lg font-bold text-heading mb-2">Gratuit</h3>
          <p className="text-sm text-muted mb-4">
            Pour commencer, sans compte ni paiement.
          </p>

          <p className="mb-6">
            <span className="text-4xl font-black text-heading">0€</span>
          </p>

          <ul className="space-y-2.5 flex-1">
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
              Plan actuel
            </div>
          )}
        </div>

        {/* Yearly — featured */}
        <button
          type="button"
          onClick={() => setSelectedPlan('yearly')}
          aria-pressed={selectedPlan === 'yearly'}
          className={`relative rounded-2xl p-6 flex flex-col text-left transition-all cursor-pointer ${
            selectedPlan === 'yearly'
              ? 'bg-gradient-to-br from-accent/20 to-brand/10 border-2 border-accent shadow-lg shadow-accent/10'
              : 'bg-surface-card border-2 border-card-border hover:border-accent/40'
          }`}
        >
          {/* Badge */}
          <div className="absolute -top-3 left-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-accent px-3 py-1 rounded-full">
              <Zap className="w-3 h-3" aria-hidden="true" />
              Meilleure offre
            </span>
          </div>

          <h3 className="font-display text-lg font-bold text-heading mt-1 mb-2">Abonnement Annuel</h3>
          <p className="text-sm text-muted mb-4">
            365 jours pour progresser et atteindre tes objectifs.
          </p>

          {/* Price */}
          <p className="mb-2">
            <span className="text-4xl font-black text-heading">99,99€</span>
            <span className="text-base text-muted ml-1">/ an</span>
          </p>

          {/* Monthly equivalent */}
          <div className="inline-flex self-start px-3 py-1 rounded-full bg-surface border border-divider text-xs font-semibold text-heading mb-4">
            soit 8,33€ / mois
          </div>

          {/* Features */}
          <ul className="space-y-2.5 flex-1">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-body">{f}</span>
              </li>
            ))}
          </ul>

          {/* Offer details */}
          <div className="mt-5 pt-4 border-t border-divider">
            <p className="text-xs font-semibold text-subtle mb-2">Détails de l'offre</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-xs text-muted">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                99,99€ prélevés tous les ans
              </li>
              {OFFER_DETAILS.map((d) => (
                <li key={d} className="flex items-center gap-2 text-xs text-muted">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </button>

        {/* Monthly */}
        <button
          type="button"
          onClick={() => setSelectedPlan('monthly')}
          aria-pressed={selectedPlan === 'monthly'}
          className={`relative rounded-2xl p-6 flex flex-col text-left transition-all cursor-pointer ${
            selectedPlan === 'monthly'
              ? 'bg-gradient-to-br from-brand/10 to-accent/5 border-2 border-brand shadow-lg shadow-brand/10'
              : 'bg-surface-card border-2 border-card-border hover:border-brand/40'
          }`}
        >
          <h3 className="font-display text-lg font-bold text-heading mb-2">Abonnement Mensuel</h3>
          <p className="text-sm text-muted mb-4">
            Un mois pour tester et découvrir tout le potentiel de Wan2Fit.
          </p>

          {/* Price */}
          <p className="mb-6">
            <span className="text-4xl font-black text-heading">9,99€</span>
            <span className="text-base text-muted ml-1">/ mois</span>
          </p>

          {/* Features */}
          <ul className="space-y-2.5 flex-1">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-sm text-body">{f}</span>
              </li>
            ))}
          </ul>

          {/* Offer details */}
          <div className="mt-5 pt-4 border-t border-divider">
            <p className="text-xs font-semibold text-subtle mb-2">Détails de l'offre</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2 text-xs text-muted">
                <Check className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                9,99€ prélevés tous les mois
              </li>
              {OFFER_DETAILS.map((d) => (
                <li key={d} className="flex items-center gap-2 text-xs text-muted">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </button>
      </div>

      {/* CGV checkbox + CTA */}
      <div className="max-w-md mx-auto mt-8 space-y-4">
        {user && (
          <>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedCgv}
                onChange={(e) => { setAcceptedCgv(e.target.checked); setError(null); }}
                className="mt-0.5 h-4 w-4 rounded border-divider accent-brand"
              />
              <span className="text-sm text-muted">
                J'accepte les{' '}
                <Link to="/legal/cgv" target="_blank" className="text-link hover:text-link-hover transition-colors">
                  Conditions Générales de Vente
                </Link>
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-accent hover:bg-accent/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  {selectedPlan === 'yearly' ? 'Passer Premium — 99,99€/an' : 'Passer Premium — 9,99€/mois'}
                </>
              )}
            </button>
          </>
        )}

        {!user && (
          <Link
            to="/signup"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-accent hover:bg-accent/90 transition-colors"
          >
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            Créer un compte pour commencer
          </Link>
        )}
      </div>

      {/* Legal note */}
      <div className="mt-6 text-center text-xs text-muted space-y-1">
        <p>Prix TTC. TVA 20% incluse. Paiement sécurisé par Stripe.</p>
      </div>
    </div>
  );
}
