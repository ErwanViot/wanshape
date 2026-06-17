// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAuthRedirectUrl } from './auth-redirects.ts';
import * as capacitorModule from './capacitor.ts';

describe('getAuthRedirectUrl', () => {
  const isNativeSpy = vi.spyOn(capacitorModule, 'isNative');
  const originalLocation = window.location;

  beforeEach(() => {
    isNativeSpy.mockReset();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it('uses window.location.origin on web (preview, dev, prod all benefit)', () => {
    isNativeSpy.mockReturnValue(false);
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://wan2fit-preview.vercel.app' },
      writable: true,
    });
    expect(getAuthRedirectUrl('/reset-password')).toBe('https://wan2fit-preview.vercel.app/reset-password');
  });

  it('forces production origin on native so AASA + assetlinks resolve', () => {
    isNativeSpy.mockReturnValue(true);
    Object.defineProperty(window, 'location', {
      value: { origin: 'capacitor://localhost' },
      writable: true,
    });
    expect(getAuthRedirectUrl('/reset-password')).toBe('https://wan2fit.fr/reset-password');
    expect(getAuthRedirectUrl('/auth/callback')).toBe('https://wan2fit.fr/auth/callback');
  });

  it('preserves query strings in the path', () => {
    isNativeSpy.mockReturnValue(true);
    expect(getAuthRedirectUrl('/upgrade?priceId=price_monthly')).toBe(
      'https://wan2fit.fr/upgrade?priceId=price_monthly',
    );
  });
});
