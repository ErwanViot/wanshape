import { extractEdgeFunctionError } from '../utils/edgeFunction.ts';
import { isNative } from './capacitor.ts';
import { supabase } from './supabase.ts';

// Native-side handoff for the Stripe checkout (Apple guideline 3.1.3(b)
// Multiplatform Service: the app sends the user to wan2fit.fr to complete
// the purchase, we never show a price or a buy button inside the app).
//
// Flow: invoke create-web-upgrade-link to get a single-use magic link
// pointing to https://wan2fit.fr/upgrade?priceId=…, then open it with
// @capacitor/browser. SafariViewController on iOS / Chrome Custom Tabs on
// Android reuse the system cookies, so the user stays logged-in everywhere
// the app trusts the same domain. The `presentationStyle: popover` keeps
// the in-app feel — the user can dismiss with a single tap.
export async function openWebUpgrade(priceId: string): Promise<string | null> {
  if (!isNative()) {
    return 'Native-only flow called from web — this should not happen';
  }
  if (!supabase) return 'Service indisponible';

  const { data, error } = await supabase.functions.invoke('create-web-upgrade-link', {
    body: { priceId },
  });

  if (error) {
    return await extractEdgeFunctionError(
      error as unknown as Record<string, unknown>,
      "Échec de la génération du lien d'upgrade",
    );
  }

  if (!data?.url) {
    return data?.error || "Lien d'upgrade indisponible";
  }

  const { Browser } = await import('@capacitor/browser');
  // SafariViewController (iOS) / Chrome Custom Tab (Android) — programmatic
  // open does NOT trigger Universal Links / App Links resolution, so the
  // /upgrade* AASA pattern won't bounce the user back into the app and
  // create a redirect loop.
  await Browser.open({
    url: data.url,
    presentationStyle: 'popover',
  });
  return null;
}
