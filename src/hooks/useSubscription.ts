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

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        // Extract actual error from function response body
        let message = 'Erreur lors de la création de la session de paiement';
        try {
          const ctx = (error as Record<string, unknown>).context;
          if (ctx && typeof (ctx as Response).json === 'function') {
            const body = await (ctx as Response).json();
            if (body?.error && typeof body.error === 'string') message = body.error;
          }
        } catch { /* keep default */ }
        throw new Error(message);
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data?.error || 'Erreur lors de la création de la session de paiement');
      }
    },
    [user],
  );

  const manageSubscription = useCallback(async () => {
    if (!supabase || !user) return;

    const { data, error } = await supabase.functions.invoke('create-portal-session');

    if (error) {
      throw new Error(error.message || 'Erreur lors de l\'ouverture du portail');
    }

    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data?.error || 'Erreur lors de l\'ouverture du portail');
    }
  }, [user]);

  return { tier, isPremium, subscription, loading, checkout, manageSubscription };
}
