// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mocks for @capacitor/push-notifications. Each test wires up
// checkPermissions / requestPermissions / addListener as it needs.
const mockCheckPermissions = vi.fn();
const mockRequestPermissions = vi.fn();
const mockAddListener = vi.fn();
const mockRegister = vi.fn();
const mockRemove = vi.fn();

vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: {
    checkPermissions: (...args: unknown[]) => mockCheckPermissions(...args),
    requestPermissions: (...args: unknown[]) => mockRequestPermissions(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  },
}));

// Mocks for the platform-detection helpers.
const mockIsNative = vi.fn();
const mockIsIOS = vi.fn();
const mockIsAndroid = vi.fn();
vi.mock('../lib/capacitor.ts', () => ({
  isNative: () => mockIsNative(),
  isIOS: () => mockIsIOS(),
  isAndroid: () => mockIsAndroid(),
}));

// Mock supabase. Tests can flip this to null via vi.doMock if needed,
// but the supabase identity itself isn't reassignable mid-suite, so
// we use a getter the hook reads each render.
const mockInvoke = vi.fn();
let supabaseValue: { functions: { invoke: typeof mockInvoke } } | null = {
  functions: { invoke: mockInvoke },
};
vi.mock('../lib/supabase.ts', () => ({
  get supabase() {
    return supabaseValue;
  },
}));

// Mock useAuth — the hook only reads `user.id`, nothing else.
let mockUserId: string | null = null;
vi.mock('../contexts/AuthContext.tsx', () => ({
  useAuth: () => ({ user: mockUserId ? { id: mockUserId } : null }),
}));

import { usePushNotifications } from './usePushNotifications.ts';

describe('usePushNotifications', () => {
  beforeEach(() => {
    mockCheckPermissions.mockReset();
    mockRequestPermissions.mockReset();
    mockAddListener.mockReset();
    mockRegister.mockReset();
    mockRemove.mockReset();
    mockInvoke.mockReset();
    mockIsNative.mockReset();
    mockIsIOS.mockReset();
    mockIsAndroid.mockReset();
    mockUserId = null;
    supabaseValue = { functions: { invoke: mockInvoke } };
    mockAddListener.mockResolvedValue({ remove: mockRemove });
    mockInvoke.mockResolvedValue({ data: null, error: null });
    // The hook short-circuits unless VITE_PUSH_ENABLED is the string "true".
    // Default the flag on so existing happy-path tests keep covering the
    // permission/registration flow; tests that exercise the off-state
    // override this in their own setup.
    vi.stubEnv('VITE_PUSH_ENABLED', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  describe('early-returns', () => {
    it('does nothing on web (isNative=false), even when authenticated', () => {
      mockIsNative.mockReturnValue(false);
      mockUserId = 'user-1';

      renderHook(() => usePushNotifications());

      expect(mockCheckPermissions).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();
      expect(mockAddListener).not.toHaveBeenCalled();
    });

    it('does nothing on native when the user is not authenticated', () => {
      mockIsNative.mockReturnValue(true);
      mockUserId = null;

      renderHook(() => usePushNotifications());

      expect(mockCheckPermissions).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('does nothing on native when supabase client is null', () => {
      mockIsNative.mockReturnValue(true);
      mockUserId = 'user-1';
      supabaseValue = null;

      renderHook(() => usePushNotifications());

      expect(mockCheckPermissions).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('does nothing when VITE_PUSH_ENABLED is not "true" (Firebase not provisioned)', () => {
      vi.stubEnv('VITE_PUSH_ENABLED', 'false');
      mockIsNative.mockReturnValue(true);
      mockUserId = 'user-1';

      renderHook(() => usePushNotifications());

      expect(mockCheckPermissions).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('permission flow', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
      mockUserId = 'user-1';
    });

    it('does not register when the OS denies permission outright', async () => {
      mockCheckPermissions.mockResolvedValue({ receive: 'denied' });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(mockCheckPermissions).toHaveBeenCalled());
      expect(mockRequestPermissions).not.toHaveBeenCalled();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('prompts when status is "prompt" and registers on grant', async () => {
      mockCheckPermissions.mockResolvedValue({ receive: 'prompt' });
      mockRequestPermissions.mockResolvedValue({ receive: 'granted' });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(mockRegister).toHaveBeenCalled());
      expect(mockRequestPermissions).toHaveBeenCalled();
      // Two listeners: 'registration' and 'registrationError'.
      expect(mockAddListener).toHaveBeenCalledTimes(2);
    });

    it('aborts after a "prompt-with-rationale" denial', async () => {
      mockCheckPermissions.mockResolvedValue({ receive: 'prompt-with-rationale' });
      mockRequestPermissions.mockResolvedValue({ receive: 'denied' });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(mockRequestPermissions).toHaveBeenCalled());
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('skips the prompt when permission is already granted', async () => {
      mockCheckPermissions.mockResolvedValue({ receive: 'granted' });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(mockRegister).toHaveBeenCalled());
      expect(mockRequestPermissions).not.toHaveBeenCalled();
    });
  });

  describe('token registration', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
      mockUserId = 'user-1';
      mockCheckPermissions.mockResolvedValue({ receive: 'granted' });
    });

    it('forwards a fresh token to register-push-device with platform=ios', async () => {
      mockIsIOS.mockReturnValue(true);
      mockIsAndroid.mockReturnValue(false);
      let registrationCallback: ((token: { value: string }) => Promise<void>) | null = null;
      mockAddListener.mockImplementation((event: string, cb: (token: { value: string }) => Promise<void>) => {
        if (event === 'registration') registrationCallback = cb;
        return Promise.resolve({ remove: mockRemove });
      });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(registrationCallback).not.toBeNull());
      await registrationCallback!({ value: 'fcm-token-abc' });

      expect(mockInvoke).toHaveBeenCalledWith('register-push-device', {
        body: { token: 'fcm-token-abc', platform: 'ios' },
      });
    });

    it('falls back to platform="web" on a non-iOS, non-Android Capacitor host', async () => {
      mockIsIOS.mockReturnValue(false);
      mockIsAndroid.mockReturnValue(false);
      let registrationCallback: ((token: { value: string }) => Promise<void>) | null = null;
      mockAddListener.mockImplementation((event: string, cb: (token: { value: string }) => Promise<void>) => {
        if (event === 'registration') registrationCallback = cb;
        return Promise.resolve({ remove: mockRemove });
      });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(registrationCallback).not.toBeNull());
      await registrationCallback!({ value: 'fcm-token-xyz' });

      expect(mockInvoke).toHaveBeenCalledWith('register-push-device', {
        body: { token: 'fcm-token-xyz', platform: 'web' },
      });
    });

    it('skips the round-trip when the same token is delivered twice in a session', async () => {
      mockIsIOS.mockReturnValue(false);
      mockIsAndroid.mockReturnValue(true);
      let registrationCallback: ((token: { value: string }) => Promise<void>) | null = null;
      mockAddListener.mockImplementation((event: string, cb: (token: { value: string }) => Promise<void>) => {
        if (event === 'registration') registrationCallback = cb;
        return Promise.resolve({ remove: mockRemove });
      });

      renderHook(() => usePushNotifications());

      await waitFor(() => expect(registrationCallback).not.toBeNull());
      await registrationCallback!({ value: 'same-token' });
      await registrationCallback!({ value: 'same-token' });

      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
      mockUserId = 'user-1';
      mockCheckPermissions.mockResolvedValue({ receive: 'granted' });
    });

    it('removes both listeners on unmount', async () => {
      const { unmount } = renderHook(() => usePushNotifications());

      await waitFor(() => expect(mockAddListener).toHaveBeenCalledTimes(2));
      unmount();

      // Both 'registration' and 'registrationError' handles must be removed.
      expect(mockRemove).toHaveBeenCalledTimes(2);
    });
  });
});
