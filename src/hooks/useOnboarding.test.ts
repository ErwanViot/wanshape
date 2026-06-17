// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @capacitor/preferences. We define the mock fns inline so each
// test can re-stub them via mockResolvedValue / mockClear.
const mockGet = vi.fn();
const mockSet = vi.fn();

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

// Mock capacitor.ts so isNative() can flip per test.
const mockIsNative = vi.fn();
vi.mock('../lib/capacitor.ts', () => ({
  isNative: () => mockIsNative(),
}));

import { useOnboarding } from './useOnboarding.ts';

describe('useOnboarding', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockSet.mockReset();
    mockIsNative.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns done immediately on web (skips Preferences entirely)', () => {
    mockIsNative.mockReturnValue(false);
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.state).toBe('done');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('starts in loading then transitions to pending when no flag is stored', async () => {
    mockIsNative.mockReturnValue(true);
    mockGet.mockResolvedValue({ value: null });

    const { result } = renderHook(() => useOnboarding());
    expect(result.current.state).toBe('loading');
    await waitFor(() => expect(result.current.state).toBe('pending'));
    expect(mockGet).toHaveBeenCalledWith({ key: 'wan2fit-onboarding-seen' });
  });

  it('transitions to done when the flag is already stored', async () => {
    mockIsNative.mockReturnValue(true);
    mockGet.mockResolvedValue({ value: '1' });

    const { result } = renderHook(() => useOnboarding());
    await waitFor(() => expect(result.current.state).toBe('done'));
  });

  it('falls back to done if Preferences.get throws (avoids blocking the UI)', async () => {
    mockIsNative.mockReturnValue(true);
    mockGet.mockRejectedValue(new Error('plugin missing'));

    const { result } = renderHook(() => useOnboarding());
    await waitFor(() => expect(result.current.state).toBe('done'));
  });

  it('markCompleted updates state to done and writes the flag', async () => {
    mockIsNative.mockReturnValue(true);
    mockGet.mockResolvedValue({ value: null });
    mockSet.mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());
    await waitFor(() => expect(result.current.state).toBe('pending'));

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(result.current.state).toBe('done');
    expect(mockSet).toHaveBeenCalledWith({ key: 'wan2fit-onboarding-seen', value: '1' });
  });

  it('markCompleted on web flips state without touching Preferences', async () => {
    mockIsNative.mockReturnValue(false);
    const { result } = renderHook(() => useOnboarding());

    await act(async () => {
      await result.current.markCompleted();
    });

    expect(result.current.state).toBe('done');
    expect(mockSet).not.toHaveBeenCalled();
  });
});
