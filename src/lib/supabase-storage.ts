import { Preferences } from '@capacitor/preferences';
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

const capacitorPreferencesAdapter: StorageAdapter = {
  async getItem(key) {
    const { value } = await Preferences.get({ key });
    return value;
  },
  async setItem(key, value) {
    await Preferences.set({ key, value });
  },
  async removeItem(key) {
    await Preferences.remove({ key });
  },
};

export function getSupabaseStorage(): StorageAdapter | undefined {
  return isNative() ? capacitorPreferencesAdapter : undefined;
}
