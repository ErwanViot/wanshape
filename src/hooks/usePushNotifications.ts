import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { isAndroid, isIOS, isNative } from '../lib/capacitor.ts';
import { supabase } from '../lib/supabase.ts';

// Bootstrap the FCM device registration on native launch:
//   1. Ask the OS for notification permission (no-op if already decided).
//   2. Subscribe to the registration event so we receive the FCM token.
//   3. POST that token to register-push-device so the server-side fan-out
//      (send-push edge function) can target this device.
//
// Re-runs on every user change. We intentionally do NOT prompt for
// permission until the user is signed in — Apple flags pre-auth prompts
// as friction during App Review.
//
// Web is a no-op: Capacitor.isNativePlatform() returns false and the hook
// short-circuits before any plugin import.
export function usePushNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const registeredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isNative() || !userId || !supabase) return;

    let cancelled = false;
    const removers: Array<() => void> = [];

    const setup = async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      const permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
        const result = await PushNotifications.requestPermissions();
        if (cancelled || result.receive !== 'granted') return;
      } else if (permission.receive !== 'granted') {
        return;
      }

      const regHandle = await PushNotifications.addListener('registration', async (token) => {
        if (cancelled) return;
        // Avoid an extra round-trip if the OS hands us back the same token
        // we already pushed during this session.
        if (registeredToken.current === token.value) return;
        registeredToken.current = token.value;
        // Migration 025 enforces platform IN ('ios','android','web') —
        // fall back to 'web' (instead of 'unknown') so a Capacitor build
        // running on an unrecognised host doesn't fail the CHECK.
        const platform = isIOS() ? 'ios' : isAndroid() ? 'android' : 'web';
        const { error } = await supabase!.functions.invoke('register-push-device', {
          body: { token: token.value, platform },
        });
        if (error) console.warn('register-push-device failed', error);
      });
      removers.push(() => regHandle.remove());

      const errHandle = await PushNotifications.addListener('registrationError', (err) => {
        console.warn('PushNotifications registrationError', err);
      });
      removers.push(() => errHandle.remove());

      await PushNotifications.register();
    };

    void setup();

    return () => {
      cancelled = true;
      for (const fn of removers) fn();
    };
  }, [userId]);
}
