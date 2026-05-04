import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import i18n from '../i18n/index.ts';
import { isNative } from '../lib/capacitor.ts';
import { openWebUpgrade } from '../lib/native-upgrade.ts';
import { supabase } from '../lib/supabase.ts';
import { notifySessionExpired, supabaseQuery } from '../lib/supabaseQuery.ts';
import type { Subscription } from '../types/subscription.ts';
import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';

// Hook errors (FR/EN) live under common:hook_errors and are resolved at call
// time so the user's current locale wins. Hooks can't use useTranslation
// reactively because some callers (mutations) run outside React render.
const tHookError = (key: string) => i18n.t(`hook_errors.${key}`, { ns: 'common' });

export function useSubscription() {
  const { profile, user } = useAuth();
  const queryClient = useQueryClient();
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
      if (!supabase || !user) return tHookError('not_signed_in');

      // Native bypass: hand the user off to wan2fit.fr via a one-shot
      // magic link so the Stripe checkout never runs inside the app
      // WebView (Apple guideline 3.1.3(b) — no in-app price/purchase UI).
      if (isNative()) {
        return openWebUpgrade(priceId);
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        const message = await extractEdgeFunctionError(
          error as unknown as Record<string, unknown>,
          tHookError('checkout_session_failed'),
        );
        return message;
      }

      if (data?.url) {
        window.location.href = data.url;
        return null;
      }
      return data?.error || tHookError('checkout_session_failed');
    },
    [user],
  );

  const manageSubscription = useCallback(async (): Promise<string | null> => {
    if (!supabase || !user) return tHookError('not_signed_in');

    const { data, error } = await supabase.functions.invoke('create-portal-session');

    if (error) {
      const msg = error.message || tHookError('portal_open_failed');
      return msg;
    }

    if (data?.url) {
      // Native: SafariViewController / Chrome Custom Tab so the user stays
      // inside the app shell. We listen for the dismiss event and
      // invalidate the subscription cache so the UI reflects whatever the
      // user just did in the Stripe portal (cancel, switch plan, etc.).
      if (isNative()) {
        const { Browser } = await import('@capacitor/browser');
        const finishedHandle = await Browser.addListener('browserFinished', () => {
          void queryClient.invalidateQueries({ queryKey: ['subscription'] });
          void queryClient.invalidateQueries({ queryKey: ['profile'] });
          void finishedHandle.remove();
        });
        await Browser.open({ url: data.url, presentationStyle: 'popover' });
        return null;
      }
      window.location.href = data.url;
      return null;
    }
    return data?.error || tHookError('portal_open_failed');
  }, [user, queryClient]);

  return {
    tier,
    isPremium,
    subscription: query.data ?? null,
    loading: query.isPending && isPremium,
    checkout,
    manageSubscription,
  };
}
