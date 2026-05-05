// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockKeepAwake = vi.fn();
const mockAllowSleep = vi.fn();

vi.mock('@capacitor-community/keep-awake', () => ({
  KeepAwake: {
    keepAwake: (...args: unknown[]) => mockKeepAwake(...args),
    allowSleep: (...args: unknown[]) => mockAllowSleep(...args),
  },
}));

const mockIsNative = vi.fn();
vi.mock('../lib/capacitor.ts', () => ({
  isNative: () => mockIsNative(),
}));

import { useWakeLock } from './useWakeLock.ts';

describe('useWakeLock', () => {
  beforeEach(() => {
    mockKeepAwake.mockReset().mockResolvedValue(undefined);
    mockAllowSleep.mockReset().mockResolvedValue(undefined);
    mockIsNative.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when active is false', () => {
    mockIsNative.mockReturnValue(true);
    renderHook(() => useWakeLock(false));
    expect(mockKeepAwake).not.toHaveBeenCalled();
  });

  describe('native', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
    });

    it('calls KeepAwake.keepAwake when active flips to true', async () => {
      renderHook(() => useWakeLock(true));
      await waitFor(() => expect(mockKeepAwake).toHaveBeenCalledTimes(1));
    });

    it('calls allowSleep on unmount to release the screen lock', async () => {
      const { unmount } = renderHook(() => useWakeLock(true));
      await waitFor(() => expect(mockKeepAwake).toHaveBeenCalled());
      unmount();
      await waitFor(() => expect(mockAllowSleep).toHaveBeenCalledTimes(1));
    });

    it('swallows plugin errors silently (UX never blocked on keep-awake failures)', async () => {
      mockKeepAwake.mockRejectedValueOnce(new Error('plugin missing'));
      const { unmount } = renderHook(() => useWakeLock(true));
      await waitFor(() => expect(mockKeepAwake).toHaveBeenCalled());
      // No throw at unmount either.
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('web', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(false);
    });

    it('requests the web Wake Lock API and releases on unmount', async () => {
      const release = vi.fn().mockResolvedValue(undefined);
      const sentinel = { release } as unknown as WakeLockSentinel;
      const request = vi.fn().mockResolvedValue(sentinel);
      Object.defineProperty(navigator, 'wakeLock', {
        value: { request },
        configurable: true,
      });

      const { unmount } = renderHook(() => useWakeLock(true));
      await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
      unmount();
      await waitFor(() => expect(release).toHaveBeenCalledTimes(1));
    });
  });
});
