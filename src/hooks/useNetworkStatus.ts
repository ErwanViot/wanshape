import { useEffect, useState } from 'react';
import { isNative } from '../lib/capacitor.ts';

// Subscribe to online/offline transitions.
// Native: @capacitor/network gives a richer status (cellular vs wifi) but
// we only surface a boolean here — the OfflineBanner is a single state.
// Web: navigator.onLine + the online/offline events. Reliable in modern
// browsers; the rare false positive (online === true but no DNS) degrades
// gracefully because TanStack Query retries failed requests.
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    if (isNative()) {
      let cancelled = false;
      let removeListener: (() => void) | null = null;

      void import('@capacitor/network').then(({ Network }) => {
        if (cancelled) return;
        void Network.getStatus().then((status) => {
          if (!cancelled) setIsOnline(status.connected);
        });
        void Network.addListener('networkStatusChange', (status) => {
          setIsOnline(status.connected);
        }).then((handle) => {
          if (cancelled) {
            handle.remove();
          } else {
            removeListener = () => handle.remove();
          }
        });
      });

      return () => {
        cancelled = true;
        removeListener?.();
      };
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
