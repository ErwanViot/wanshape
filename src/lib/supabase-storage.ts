import { isNative } from './capacitor.ts';

// Supabase auth storage interface (sync OR async).
// On native, WebView localStorage can be wiped silently by the OS, so we
// persist auth tokens in @capacitor/preferences (KV backed by NSUserDefaults
// on iOS and SharedPreferences on Android — both stable across app launches).
// On web we return undefined so Supabase falls back to its built-in
// localStorage adapter (no behaviour change for the PWA).
type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// Lazy-loaded native module so the web bundle never imports
// @capacitor/preferences (matches the dynamic-import pattern in capacitor.ts).
let preferencesPromise: Promise<typeof import('@capacitor/preferences')> | null = null;
function loadPreferences() {
  if (!preferencesPromise) {
    preferencesPromise = import('@capacitor/preferences');
  }
  return preferencesPromise;
}

const capacitorPreferencesAdapter: StorageAdapter = {
  async getItem(key) {
    const { Preferences } = await loadPreferences();
    const { value } = await Preferences.get({ key });
    return value;
  },
  async setItem(key, value) {
    const { Preferences } = await loadPreferences();
    await Preferences.set({ key, value });
  },
  async removeItem(key) {
    const { Preferences } = await loadPreferences();
    await Preferences.remove({ key });
  },
};

export function getSupabaseStorage(): StorageAdapter | undefined {
  return isNative() ? capacitorPreferencesAdapter : undefined;
}
