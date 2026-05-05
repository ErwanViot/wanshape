// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @capacitor/network. Each test stubs the resolved value of
// getStatus / addListener as needed. addListener returns a handle
// shaped like the real plugin: { remove }.
const mockGetStatus = vi.fn();
const mockAddListener = vi.fn();
const mockRemove = vi.fn();

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: (...args: unknown[]) => mockGetStatus(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
  },
}));

const mockIsNative = vi.fn();
vi.mock('../lib/capacitor.ts', () => ({
  isNative: () => mockIsNative(),
}));

import { useNetworkStatus } from './useNetworkStatus.ts';

describe('useNetworkStatus', () => {
  beforeEach(() => {
    mockGetStatus.mockReset();
    mockAddListener.mockReset();
    mockRemove.mockReset();
    mockIsNative.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('web', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(false);
    });

    it('returns true when navigator.onLine is true at mount', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(true);
    });

    it('flips to navigator.onLine value on first effect tick', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const { result } = renderHook(() => useNetworkStatus());
      await waitFor(() => expect(result.current).toBe(false));
    });

    it('reacts to the offline event', async () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      const { result } = renderHook(() => useNetworkStatus());
      await waitFor(() => expect(result.current).toBe(true));

      await act(async () => {
        window.dispatchEvent(new Event('offline'));
      });
      expect(result.current).toBe(false);
    });

    it('reacts to the online event', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      const { result } = renderHook(() => useNetworkStatus());
      await waitFor(() => expect(result.current).toBe(false));

      await act(async () => {
        window.dispatchEvent(new Event('online'));
      });
      expect(result.current).toBe(true);
    });

    it('does not register the Capacitor listener on web', () => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      renderHook(() => useNetworkStatus());
      expect(mockGetStatus).not.toHaveBeenCalled();
      expect(mockAddListener).not.toHaveBeenCalled();
    });
  });

  describe('native', () => {
    beforeEach(() => {
      mockIsNative.mockReturnValue(true);
    });

    it('starts optimistic (true) and updates from Network.getStatus', async () => {
      mockGetStatus.mockResolvedValue({ connected: false });
      mockAddListener.mockResolvedValue({ remove: mockRemove });

      const { result } = renderHook(() => useNetworkStatus());
      expect(result.current).toBe(true); // optimistic
      await waitFor(() => expect(result.current).toBe(false));
      expect(mockGetStatus).toHaveBeenCalled();
    });

    it('subscribes to networkStatusChange', async () => {
      mockGetStatus.mockResolvedValue({ connected: true });
      mockAddListener.mockResolvedValue({ remove: mockRemove });

      renderHook(() => useNetworkStatus());
      await waitFor(() => expect(mockAddListener).toHaveBeenCalledWith('networkStatusChange', expect.any(Function)));
    });

    it('reflects networkStatusChange events as they arrive', async () => {
      mockGetStatus.mockResolvedValue({ connected: true });
      let listenerCallback: ((status: { connected: boolean }) => void) | null = null;
      mockAddListener.mockImplementation((_event, cb) => {
        listenerCallback = cb;
        return Promise.resolve({ remove: mockRemove });
      });

      const { result } = renderHook(() => useNetworkStatus());
      await waitFor(() => expect(listenerCallback).not.toBeNull());

      await act(async () => {
        listenerCallback?.({ connected: false });
      });
      expect(result.current).toBe(false);

      await act(async () => {
        listenerCallback?.({ connected: true });
      });
      expect(result.current).toBe(true);
    });

    it('removes the listener on unmount', async () => {
      mockGetStatus.mockResolvedValue({ connected: true });
      mockAddListener.mockResolvedValue({ remove: mockRemove });

      const { unmount } = renderHook(() => useNetworkStatus());
      await waitFor(() => expect(mockAddListener).toHaveBeenCalled());

      unmount();
      expect(mockRemove).toHaveBeenCalledTimes(1);
    });
  });
});
