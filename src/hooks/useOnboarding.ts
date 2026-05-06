import { useCallback, useEffect, useState } from 'react';
import { isNative } from '../lib/capacitor.ts';

const STORAGE_KEY = 'wan2fit-onboarding-seen';

type OnboardingState = 'loading' | 'pending' | 'done';

// Tracks whether the native first-launch onboarding carousel has already
// been shown for this install. Persisted via @capacitor/preferences (i.e.
// NSUserDefaults / SharedPreferences) so a WebView storage purge doesn't
// re-prompt the user.
//
// We intentionally use the plain (unencrypted) Preferences store here, NOT
// the new SecureStorage adapter that supabase-storage.ts uses for auth
// tokens. The onboarding flag is a non-sensitive boolean ("1"/null) — no
// security gain to encrypting it, and Keychain entries don't survive an
// app uninstall on iOS, so a reinstall would unnecessarily re-prompt the
// user with the carousel.
//
// Web: returns 'done' immediately. The onboarding is intentionally
// native-only — Apple App Reviewers care that the iOS first launch
// pitches the value of the app, the PWA gets it via wan2fit.fr's home.
export function useOnboarding(): {
  state: OnboardingState;
  markCompleted: () => Promise<void>;
} {
  const [state, setState] = useState<OnboardingState>(() => (isNative() ? 'loading' : 'done'));

  useEffect(() => {
    if (!isNative()) return;
    let cancelled = false;
    void (async () => {
      try {
        const { Preferences } = await import('@capacitor/preferences');
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (cancelled) return;
        setState(value === '1' ? 'done' : 'pending');
      } catch {
        // If Preferences fails for any reason, we fall back to "done"
        // rather than block the user behind the carousel forever.
        if (!cancelled) setState('done');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markCompleted = useCallback(async () => {
    setState('done');
    if (!isNative()) return;
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key: STORAGE_KEY, value: '1' });
    } catch {
      // Silent — the in-memory state is already updated, so the user
      // won't see the carousel again this session. Worst case it
      // re-shows on next launch, which is acceptable.
    }
  }, []);

  return { state, markCompleted };
}
