import { Purchases as RevenueCatPurchases } from '@revenuecat/purchases-capacitor';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { isNative } from '../lib/capacitor.ts';
import { captureException } from '../lib/sentryReport.ts';

// IMPORTANT: this is a STATIC import, intentionally not a dynamic `import()`.
// A previous version lazy-loaded the SDK with `import('@revenuecat/purchases-
// capacitor')` to keep the web bundle lean. Inside the iOS Capacitor WKWebView
// that dynamic import NEVER resolved — the on-screen diagnostic showed the load
// pipeline frozen at `import-sdk` forever (then our 30s safety timeout fired).
// Rollup had merged the plugin into a heavy shared chunk and the runtime
// `import()` of that chunk hangs under the `capacitor://` scheme. A static
// import is resolved by the native ESM loader when the (already-working)
// usePurchases chunk loads, so the SDK is ready synchronously. The ~30KB it
// adds to the bundle is the price of a paywall that actually loads.

type PurchasesPackage = {
  identifier: string; // $rc_monthly | $rc_annual | custom
  packageType?: string;
  product: {
    identifier: string; // wan2fit.premium.monthly | wan2fit.premium.yearly
    title: string;
    description: string;
    priceString: string; // localized "9,99 €" / "$9.99"
    price: number;
    currencyCode: string;
  };
  offeringIdentifier?: string;
};

type CustomerInfo = {
  entitlements: {
    active: Record<string, { identifier: string; isActive: boolean }>;
  };
};

type PurchasesSdk = {
  configure: (opts: { apiKey: string; appUserID: string | null }) => Promise<void>;
  getOfferings: () => Promise<{ current: { availablePackages: PurchasesPackage[] } | null }>;
  purchasePackage: (opts: { aPackage: PurchasesPackage }) => Promise<{ customerInfo: CustomerInfo }>;
  restorePurchases: () => Promise<{ customerInfo: CustomerInfo }>;
  // RevenueCat's Capacitor API takes an OPTIONS OBJECT, not a positional
  // string: logIn({ appUserID }). Passing the bare string makes the plugin see
  // `options.appUserID === undefined` → "Must provide appUserId parameter".
  logIn: (options: { appUserID: string }) => Promise<{ customerInfo: CustomerInfo }>;
  logOut: () => Promise<{ customerInfo: CustomerInfo }>;
  getCustomerInfo: () => Promise<{ customerInfo: CustomerInfo }>;
};

// The SDK is statically imported above; no async module loading needed.
// `configured` guards the one-time configure() call within a JS context.
let configured = false;

// StoreKit's first product fetch on a cold device (the App Store review
// machine, a freshly-installed TestFlight build, a sandbox tester's first
// launch) is genuinely slow — Apple's own guidance and RevenueCat's
// troubleshooting both note it can take 15-30s, occasionally more, before
// StoreKit returns products. Our previous 12s hard cap fired *before* that
// fetch completed and surfaced an error to the App Review reviewer, who
// rejected the build under guideline 2.1(b) ("subscriptions couldn't be
// loaded"). The fetch wasn't broken — we gave up too early.
//
// New strategy: a generous per-attempt timeout, retried a few times (StoreKit
// warms its cache between attempts), and only after all attempts fail do we
// show an actionable error. An empty offering is treated as a failure worth
// retrying too — RevenueCat returns an empty `current` while StoreKit is still
// resolving products rather than throwing.
const OFFERINGS_TIMEOUT_MS = 30_000;
const OFFERINGS_MAX_ATTEMPTS = 3;
const OFFERINGS_RETRY_BACKOFF_MS = 2_000;

// Records each milestone of the load pipeline (import-sdk → configure →
// offerings-try-N → …). The accumulated trail is attached to the Sentry report
// when loading fails, so an empty/stuck paywall is diagnosable from the
// dashboard instead of guessed at.
type StepFn = (step: string) => void;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label}_timeout`)), ms)),
  ]);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Return the SDK SYNCHRONOUSLY. This must never be `await`ed nor returned from
// an async function: the Capacitor `registerPlugin` proxy intercepts *every*
// property access — including `.then` — and returns a function, which makes the
// proxy a fake "thenable". Resolving any Promise with it (via `return proxy`
// from an async fn, `await proxy`, or `.then(() => proxy)`) triggers the
// runtime to call `proxy.then(resolve, reject)`; the proxy treats `then` as a
// native method name, ignores the resolve/reject callbacks, and never settles
// the Promise → an eternal hang (observed as the load pipeline frozen at
// `import-sdk` until the 30s safety timeout). Calling *methods* on the proxy is
// fine — those return real Promises. Only the proxy object itself is poison.
function getSdk(): PurchasesSdk {
  return RevenueCatPurchases as unknown as PurchasesSdk;
}

// Configure the SDK. Returns void on purpose — it must NOT return the proxy
// (see getSdk): an async fn returning the proxy would adopt it as a thenable
// and hang. Callers grab the SDK synchronously via getSdk() after this resolves.
async function ensureConfigured(userId: string | null, onStep: StepFn = () => {}): Promise<void> {
  onStep('import-sdk');
  const sdk = getSdk();
  onStep('sdk-loaded');
  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY_IOS as string | undefined;
  if (!apiKey) {
    throw new Error('apikey-missing');
  }
  if (!configured) {
    onStep('configure');
    await sdk.configure({ apiKey, appUserID: userId });
    configured = true;
    onStep('configured');
  } else if (userId) {
    // Already configured — bind/rebind the user. logIn is idempotent and
    // reuses the same customer if appUserID matches.
    onStep('login');
    await sdk.logIn({ appUserID: userId });
    onStep('logged-in');
  }
}

// Fetch offerings with bounded retries. Returns the available packages, or
// throws the last error after exhausting attempts. Treats an empty offering as
// a retryable miss (StoreKit still resolving) rather than a definitive answer.
async function fetchOfferingsWithRetry(sdk: PurchasesSdk, onStep: StepFn = () => {}): Promise<PurchasesPackage[]> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= OFFERINGS_MAX_ATTEMPTS; attempt++) {
    try {
      onStep(`offerings-try-${attempt}`);
      const offerings = await withTimeout(sdk.getOfferings(), OFFERINGS_TIMEOUT_MS, 'offerings');
      const list = offerings.current?.availablePackages ?? [];
      if (list.length > 0) {
        onStep(`offerings-ok-${list.length}`);
        return list;
      }
      // Empty — StoreKit likely still warming up. Retry unless this was the
      // last attempt, in which case return empty (genuinely no products).
      onStep(`offerings-empty-${attempt}`);
      lastError = new Error('offerings_empty');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      onStep(`offerings-err-${attempt}:${lastError.message}`);
    }
    if (attempt < OFFERINGS_MAX_ATTEMPTS) await delay(OFFERINGS_RETRY_BACKOFF_MS);
  }
  // All attempts produced an empty offering (no throw): surface empty so the
  // UI shows the "unavailable" state rather than an error.
  if (lastError?.message === 'offerings_empty') return [];
  throw lastError ?? new Error('offerings_failed');
}

interface UsePurchasesResult {
  // Loaded packages from the "default" RevenueCat offering. `null` while
  // loading or when called from a non-native context.
  packages: PurchasesPackage[] | null;
  loading: boolean;
  error: string | null;
  // Purchase a specific package. Resolves with `true` if the user is now
  // entitled to 'premium' (success path), `false` if they cancelled or the
  // purchase did not grant the entitlement.
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  // Trigger Apple/Google restore. Returns true if a premium entitlement was
  // restored, false otherwise.
  restore: () => Promise<boolean>;
}

const PREMIUM_ENTITLEMENT_ID = 'premium';

// Hook to drive the native IAP paywall. On web returns no packages and
// no-op functions — callers should still gate on `isNative()` before
// rendering paywall UI, but this hook is safe to mount unconditionally.
export function usePurchases(): UsePurchasesResult {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const [packages, setPackages] = useState<PurchasesPackage[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Avoid re-fetching offerings every time the component re-mounts in the
  // same session — RevenueCat caches them server-side anyway.
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isNative()) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Accumulate the full step trail so a Sentry failure report carries the
    // exact path taken (import-sdk → configure → offerings-try-1 → …), not just
    // the final error.
    const trail: string[] = [];
    const step: StepFn = (s) => trail.push(s);

    withTimeout(ensureConfigured(user?.id ?? null, step), OFFERINGS_TIMEOUT_MS, 'configure')
      .then(() => fetchOfferingsWithRetry(getSdk(), step))
      .then((list) => {
        if (cancelled) return;
        setPackages(list);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const raw = err instanceof Error ? err.message : String(err);
        // Report the real failure reason + the step trail to Sentry so a future
        // empty paywall (including one a reviewer hits) is diagnosable from the
        // dashboard instead of guessed at.
        captureException(err instanceof Error ? err : new Error(raw), {
          contexts: { iap: { stage: 'load_offerings', raw, trail: trail.join(' → ') } },
        });
        // A timeout means StoreKit never returned products within our (now
        // generous) window — usually a transient sandbox/App Store hiccup.
        // Surface a clear, retryable message rather than the raw SDK string.
        const message = raw.endsWith('_timeout')
          ? t('hook_errors.offerings_timeout', {
              defaultValue: 'Le chargement des abonnements a pris trop de temps. Vérifie ta connexion et réessaie.',
            })
          : raw;
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, t]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (!isNative()) return false;
      setError(null);
      try {
        await ensureConfigured(user?.id ?? null);
        const result = await getSdk().purchasePackage({ aPackage: pkg });
        const active = result.customerInfo.entitlements.active;
        return PREMIUM_ENTITLEMENT_ID in active;
      } catch (err: unknown) {
        // Apple/Google return distinct error codes for user-cancel vs real
        // failure. The SDK surfaces this as an Error with a code property —
        // we treat anything that isn't a hard failure as a silent dismiss.
        const errObj = err as { code?: string; userCancelled?: boolean; message?: string };
        if (errObj?.userCancelled || errObj?.code === 'PURCHASE_CANCELLED') {
          return false;
        }
        setError(
          errObj?.message ?? t('hook_errors.generic_retry', { defaultValue: 'Une erreur est survenue. Réessayez.' }),
        );
        return false;
      }
    },
    [user?.id, t],
  );

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isNative()) return false;
    setError(null);
    try {
      await ensureConfigured(user?.id ?? null);
      const result = await getSdk().restorePurchases();
      const active = result.customerInfo.entitlements.active;
      return PREMIUM_ENTITLEMENT_ID in active;
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setError(
        errObj?.message ?? t('hook_errors.generic_retry', { defaultValue: 'Une erreur est survenue. Réessayez.' }),
      );
      return false;
    }
  }, [user?.id, t]);

  return { packages, loading, error, purchase, restore };
}
