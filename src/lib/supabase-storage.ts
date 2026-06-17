import { isNative } from './capacitor.ts';

// Supabase auth storage interface (sync OR async).
//
// On native, the previous implementation persisted tokens in
// `@capacitor/preferences`, which is backed by `NSUserDefaults` (iOS) and
// `SharedPreferences` (Android) — neither encrypted at rest. Auth tokens
// were therefore readable through:
//   - iOS: an unencrypted iTunes/Finder backup, an MDM scrape, an app
//     extension running in the same group.
//   - Android: an `adb backup` on a USB-debug device, Google's auto
//     cloud-backup, any rooted device.
//
// We now use `@aparajita/capacitor-secure-storage` which wraps Keychain
// Services on iOS and EncryptedSharedPreferences on Android — both
// encrypted at rest with hardware-backed keys when available. On web we
// still return undefined so Supabase falls back to its built-in
// localStorage adapter (no behaviour change for the PWA).
type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// Lazy-loaded native modules so the web bundle never imports either plugin.
// SecureStorage handles current reads/writes; Preferences is kept around
// only for the one-shot legacy migration on first read after upgrade.
type SecureStorageModule = typeof import('@aparajita/capacitor-secure-storage');
type PreferencesModule = typeof import('@capacitor/preferences');

let secureStoragePromise: Promise<SecureStorageModule> | null = null;
let preferencesPromise: Promise<PreferencesModule> | null = null;

function loadSecureStorage(): Promise<SecureStorageModule> {
  if (!secureStoragePromise) {
    secureStoragePromise = import('@aparajita/capacitor-secure-storage');
  }
  return secureStoragePromise;
}

function loadPreferences(): Promise<PreferencesModule> {
  if (!preferencesPromise) {
    preferencesPromise = import('@capacitor/preferences');
  }
  return preferencesPromise;
}

// One-shot lazy migration: when the first read for `key` happens after the
// upgrade, look in the legacy Preferences store; if a value is found there,
// copy it into secure storage and erase the legacy copy. Idempotent and
// self-healing — after the first successful read, all subsequent calls go
// straight to secure storage. Per-key (not bulk) so we don't scan
// Preferences (which has no `keys()` method everywhere) — the supabase
// auth client only ever stores ~1-2 keys per project anyway.
async function migrateLegacyKey(key: string): Promise<string | null> {
  try {
    const { Preferences } = await loadPreferences();
    const { value: legacy } = await Preferences.get({ key });
    if (legacy === null || legacy === undefined) return null;
    const { SecureStorage } = await loadSecureStorage();
    await SecureStorage.setItem(key, legacy);
    await Preferences.remove({ key });
    return legacy;
  } catch (err) {
    console.warn('[supabase-storage] legacy migration failed for', key, err);
    return null;
  }
}

const secureStorageAdapter: StorageAdapter = {
  async getItem(key) {
    const { SecureStorage } = await loadSecureStorage();
    // `getItem` is the plugin's low-level string-only accessor (mirrors
    // the `StorageLikeAsync` interface). It bypasses the JSON / Date
    // round-trip that `get()` does and returns string | null verbatim,
    // which is exactly what Supabase's storage adapter expects.
    const value = await SecureStorage.getItem(key);
    if (value !== null) return value;
    // Cold start after upgrade: token may still be in @capacitor/preferences.
    return migrateLegacyKey(key);
  },
  async setItem(key, value) {
    const { SecureStorage } = await loadSecureStorage();
    // `setItem` is the string-only sibling of `set` — same rationale as
    // `getItem` above (no JSON encoding, no convertDate magic).
    await SecureStorage.setItem(key, value);
    // Defensive: if a stale legacy copy exists (mid-migration crash, etc.)
    // wipe it so the secure copy is the unique source of truth from now on.
    try {
      const { Preferences } = await loadPreferences();
      await Preferences.remove({ key });
    } catch {
      // Preferences plugin may eventually be removed — not a problem,
      // the secure write above already succeeded.
    }
  },
  async removeItem(key) {
    const { SecureStorage } = await loadSecureStorage();
    await SecureStorage.removeItem(key);
    try {
      const { Preferences } = await loadPreferences();
      await Preferences.remove({ key });
    } catch {
      // ignore
    }
  },
};

export function getSupabaseStorage(): StorageAdapter | undefined {
  return isNative() ? secureStorageAdapter : undefined;
}
