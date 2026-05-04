import { useEffect, useRef } from 'react';
import { isNative } from '../lib/capacitor.ts';

// Keep the screen on while the active flag is true.
// Native: @capacitor-community/keep-awake bridges to UIApplication
// idleTimerDisabled (iOS) and FLAG_KEEP_SCREEN_ON (Android). The Web Wake
// Lock API is unsupported in iOS WKWebView, so we route everything through
// the plugin once we run inside Capacitor.
// Web: navigator.wakeLock.request('screen') with graceful no-op when the
// API is missing or denied.
export function useWakeLock(active: boolean) {
  const webSentinel = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    if (isNative()) {
      void import('@capacitor-community/keep-awake')
        .then(({ KeepAwake }) => {
          if (cancelled) return;
          return KeepAwake.keepAwake();
        })
        .catch(() => {
          // Plugin missing or platform refused — degrade silently.
        });

      return () => {
        cancelled = true;
        void import('@capacitor-community/keep-awake').then(({ KeepAwake }) => KeepAwake.allowSleep()).catch(() => {});
      };
    }

    if (!('wakeLock' in navigator)) return;

    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        if (cancelled) {
          sentinel.release();
          return;
        }
        webSentinel.current = sentinel;
      })
      .catch(() => {
        // Wake Lock not available (e.g. low battery, background tab)
      });

    return () => {
      cancelled = true;
      webSentinel.current?.release();
      webSentinel.current = null;
    };
  }, [active]);
}
