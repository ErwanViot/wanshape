import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { Subscription } from '../types/subscription.ts';

export function useSubscription() {
  const { profile, user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  const tier = profile?.subscription_tier ?? 'free';
  const isPremium = tier === 'premium';

  // Fetch subscription details (period, cancel status, etc.)
  useEffect(() => {
    if (!supabase || !user || !isPremium) {
      setSubscription(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'past_due', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled) setSubscription(data as Subscription | null);
      } catch {
        // Subscription fetch failed — non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, isPremium]);

  const checkout = useCallback(
    async (priceId: string) => {
      if (!supabase || !user) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ priceId }),
        },
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
      }
    },
    [user],
  );

  const manageSubscription = useCallback(async () => {
    if (!supabase || !user) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || 'Erreur lors de l\'ouverture du portail');
    }
  }, [user]);

  return { tier, isPremium, subscription, loading, checkout, manageSubscription };
}
