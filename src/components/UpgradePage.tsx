import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useSubscription } from '../hooks/useSubscription.ts';
import { isNative } from '../lib/capacitor.ts';
import { LoadingFallback } from './LoadingFallback.tsx';

// Landing page consumed by the native upgrade flow:
//   1. Mobile app opens https://wan2fit.fr/upgrade?priceId=… via a one-shot
//      magic link (the link auto-authenticates the user).
//   2. This component checks the priceId, fires checkout(priceId), Stripe
//      redirects the browser to the hosted checkout page.
//   3. After Stripe success/cancel the user lands back on /tarifs (web).
//
// The page is also reachable from the web by an authenticated user — same
// behaviour, just without the magic-link hop.
export function UpgradePage() {
  const { t } = useTranslation('common');
  const { user, loading: authLoading } = useAuth();
  const { checkout, isPremium } = useSubscription();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [triggered, setTriggered] = useState(false);

  const priceId = params.get('priceId');

  useEffect(() => {
    if (authLoading || triggered) return;
    // Defense in depth: this page is the web target of a native magic
    // link. If it ever renders inside the native shell (deep link bug,
    // user shares the URL, etc.) we punt back to /tarifs to avoid a
    // checkout → openWebUpgrade → magic link → … loop.
    if (isNative()) {
      navigate('/tarifs', { replace: true });
      return;
    }
    if (!user) {
      const next = priceId ? `/upgrade?priceId=${encodeURIComponent(priceId)}` : '/upgrade';
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }
    if (!priceId) {
      navigate('/tarifs', { replace: true });
      return;
    }
    setTriggered(true);
    void checkout(priceId).then((maybeError) => {
      if (maybeError) setError(maybeError);
    });
  }, [authLoading, user, priceId, triggered, checkout, navigate]);

  // isPremium short-circuit lives below the hooks (rules of hooks).
  if (isPremium) return <Navigate to="/parametres" replace />;
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-strong">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/tarifs')}
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium"
        >
          {t('hook_errors.generic_retry')}
        </button>
      </div>
    );
  }

  return <LoadingFallback />;
}
