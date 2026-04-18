import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Subscription } from '../types/subscription.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

export function useSubscription() {
  const { profile, user } = useAuth();
  const userId = user?.id;

  const tier = profile?.subscription_tier ?? 'free';
  const isPremium = tier === 'premium';

  const query = useQuery<Subscription | null>({
    queryKey: ['subscription', userId ?? null],
    queryFn: async () => {
      const { data, sessionExpired } = await supabaseQuery(() =>
        supabase!
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId!)
          .in('status', ['active', 'past_due', 'trialing'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      );
      if (sessionExpired) {
        notifySessionExpired();
        return null;
      }
      return (data as Subscription | null) ?? null;
    },
    enabled: !!userId && !!supabase && isPremium,
  });

  const checkout = useCallback(
    async (priceId: string): Promise<string | null> => {
      if (!supabase || !user) return 'Non connecté';

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        const message = await extractEdgeFunctionError(
          error as unknown as Record<string, unknown>,
          'Erreur lors de la création de la session de paiement',
        );
        return message;
      }

      if (data?.url) {
        window.location.href = data.url;
        return null;
      }
      return data?.error || 'Erreur lors de la création de la session de paiement';
    },
    [user],
  );

  const manageSubscription = useCallback(async (): Promise<string | null> => {
    if (!supabase || !user) return 'Non connecté';

    const { data, error } = await supabase.functions.invoke('create-portal-session');

    if (error) {
      const msg = error.message || "Erreur lors de l'ouverture du portail";
      return msg;
    }

    if (data?.url) {
      window.location.href = data.url;
      return null;
    }
    return data?.error || "Erreur lors de l'ouverture du portail";
  }, [user]);

  return {
    tier,
    isPremium,
    subscription: query.data ?? null,
    loading: query.isPending && isPremium,
    checkout,
    manageSubscription,
  };
}
