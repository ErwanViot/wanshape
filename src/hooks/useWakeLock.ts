import { useEffect, useRef } from 'react';

export function useWakeLock(active: boolean) {
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;

    let released = false;

    navigator.wakeLock.request('screen').then(sentinel => {
      if (released) {
        sentinel.release();
        return;
      }
      wakeLock.current = sentinel;
    }).catch(() => {
      // Wake Lock not available (e.g. low battery, background tab)
    });

    return () => {
      released = true;
      wakeLock.current?.release();
      wakeLock.current = null;
    };
  }, [active]);
}
