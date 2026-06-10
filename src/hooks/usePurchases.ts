import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.tsx';
import { isNative } from '../lib/capacitor.ts';

// We dynamically import the RevenueCat SDK so the web bundle stays lean.
// Loading the plugin on web would no-op (it ships native bridges only) but
// even the JS wrapper adds ~30KB gzipped to the initial chunk. The native
// shell pays the cost once at first use of the paywall.
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
  logIn: (appUserID: string) => Promise<{ customerInfo: CustomerInfo }>;
  logOut: () => Promise<{ customerInfo: CustomerInfo }>;
  getCustomerInfo: () => Promise<{ customerInfo: CustomerInfo }>;
};

// Cached module — survive Vite HMR by hanging onto window. Initialising
// twice in the same JS context throws inside the native SDK.
let sdkPromise: Promise<PurchasesSdk> | null = null;
let configured = false;

async function loadSdk(): Promise<PurchasesSdk> {
  if (!sdkPromise) {
    sdkPromise = import('@revenuecat/purchases-capacitor').then((m) => m.Purchases as unknown as PurchasesSdk);
  }
  return sdkPromise;
}

async function ensureConfigured(userId: string | null): Promise<PurchasesSdk> {
  const sdk = await loadSdk();
  const apiKey = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY_IOS as string | undefined;
  if (!apiKey) {
    throw new Error('VITE_REVENUECAT_PUBLIC_API_KEY_IOS missing — IAP cannot init');
  }
  if (!configured) {
    await sdk.configure({ apiKey, appUserID: userId });
    configured = true;
  } else if (userId) {
    // Already configured — bind/rebind the user. logIn is idempotent and
    // reuses the same customer if appUserID matches.
    await sdk.logIn(userId);
  }
  return sdk;
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

    ensureConfigured(user?.id ?? null)
      .then((sdk) => sdk.getOfferings())
      .then((offerings) => {
        if (cancelled) return;
        const list = offerings.current?.availablePackages ?? [];
        setPackages(list);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      if (!isNative()) return false;
      setError(null);
      try {
        const sdk = await ensureConfigured(user?.id ?? null);
        const result = await sdk.purchasePackage({ aPackage: pkg });
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
      const sdk = await ensureConfigured(user?.id ?? null);
      const result = await sdk.restorePurchases();
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
