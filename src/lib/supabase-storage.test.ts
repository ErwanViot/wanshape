// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the secure-storage plugin. Each test wires up `getItem` / `setItem` /
// `removeItem` as it needs them. The plugin exports the public methods on
// `SecureStorage` (named export from the package).
const mockSecGetItem = vi.fn();
const mockSecSetItem = vi.fn();
const mockSecRemoveItem = vi.fn();
vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: {
    getItem: (...args: unknown[]) => mockSecGetItem(...args),
    setItem: (...args: unknown[]) => mockSecSetItem(...args),
    removeItem: (...args: unknown[]) => mockSecRemoveItem(...args),
  },
}));

// Mock the legacy Preferences plugin.
const mockPrefGet = vi.fn();
const mockPrefRemove = vi.fn();
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: (...args: unknown[]) => mockPrefGet(...args),
    remove: (...args: unknown[]) => mockPrefRemove(...args),
  },
}));

// `getSupabaseStorage()` short-circuits to undefined on web (returns the
// default localStorage adapter to Supabase). For tests we force the native
// branch to exercise the secure adapter.
const mockIsNative = vi.fn();
vi.mock('./capacitor.ts', () => ({
  isNative: () => mockIsNative(),
}));

import { getSupabaseStorage } from './supabase-storage.ts';

describe('getSupabaseStorage', () => {
  beforeEach(() => {
    mockSecGetItem.mockReset();
    mockSecSetItem.mockReset();
    mockSecRemoveItem.mockReset();
    mockPrefGet.mockReset();
    mockPrefRemove.mockReset();
    mockIsNative.mockReset();
    mockSecSetItem.mockResolvedValue(undefined);
    mockSecRemoveItem.mockResolvedValue(undefined);
    mockPrefRemove.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns undefined on web (Supabase keeps its default localStorage)', () => {
    mockIsNative.mockReturnValue(false);
    expect(getSupabaseStorage()).toBeUndefined();
  });

  describe('native adapter', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
    });

    it('reads directly from secure storage when the key is already migrated', async () => {
      mockSecGetItem.mockResolvedValue('jwt-from-keychain');
      const adapter = getSupabaseStorage();
      const value = await adapter!.getItem('sb-xxx-auth-token');
      expect(value).toBe('jwt-from-keychain');
      // Migration path must NOT be invoked for already-secure keys.
      expect(mockPrefGet).not.toHaveBeenCalled();
      expect(mockSecSetItem).not.toHaveBeenCalled();
    });

    it('migrates a legacy Preferences token into secure storage on first read', async () => {
      mockSecGetItem.mockResolvedValue(null);
      mockPrefGet.mockResolvedValue({ value: 'legacy-jwt' });
      const adapter = getSupabaseStorage();
      const value = await adapter!.getItem('sb-xxx-auth-token');
      expect(value).toBe('legacy-jwt');
      expect(mockSecSetItem).toHaveBeenCalledWith('sb-xxx-auth-token', 'legacy-jwt');
      expect(mockPrefRemove).toHaveBeenCalledWith({ key: 'sb-xxx-auth-token' });
    });

    it('returns null when neither secure nor legacy store has the key (fresh install / signed-out)', async () => {
      mockSecGetItem.mockResolvedValue(null);
      mockPrefGet.mockResolvedValue({ value: null });
      const adapter = getSupabaseStorage();
      const value = await adapter!.getItem('sb-xxx-auth-token');
      expect(value).toBeNull();
      expect(mockSecSetItem).not.toHaveBeenCalled();
      expect(mockPrefRemove).not.toHaveBeenCalled();
    });

    it('swallows migration errors and returns null instead of throwing', async () => {
      mockSecGetItem.mockResolvedValue(null);
      mockPrefGet.mockResolvedValue({ value: 'legacy-jwt' });
      mockSecSetItem.mockRejectedValue(new Error('keychain unavailable'));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = getSupabaseStorage();
      const value = await adapter!.getItem('sb-xxx-auth-token');
      expect(value).toBeNull();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('writes via secure storage on setItem and wipes any stale legacy copy', async () => {
      const adapter = getSupabaseStorage();
      await adapter!.setItem('sb-xxx-auth-token', 'fresh-jwt');
      expect(mockSecSetItem).toHaveBeenCalledWith('sb-xxx-auth-token', 'fresh-jwt');
      expect(mockPrefRemove).toHaveBeenCalledWith({ key: 'sb-xxx-auth-token' });
    });

    it('removes via secure storage on removeItem and wipes any stale legacy copy', async () => {
      const adapter = getSupabaseStorage();
      await adapter!.removeItem('sb-xxx-auth-token');
      expect(mockSecRemoveItem).toHaveBeenCalledWith('sb-xxx-auth-token');
      expect(mockPrefRemove).toHaveBeenCalledWith({ key: 'sb-xxx-auth-token' });
    });

    it('still resolves setItem when the legacy cleanup throws (defensive try/catch)', async () => {
      mockPrefRemove.mockRejectedValue(new Error('preferences gone'));
      const adapter = getSupabaseStorage();
      await expect(adapter!.setItem('sb-xxx-auth-token', 'fresh-jwt')).resolves.toBeUndefined();
      expect(mockSecSetItem).toHaveBeenCalled();
    });
  });
});
