import { describe, expect, it } from 'vitest';
import { computeToggledFavorites } from './useRecipeFavorites.ts';

describe('computeToggledFavorites', () => {
  it('adds the key when absent', () => {
    const next = computeToggledFavorites(new Set(['a']), 'b');
    expect(next).toEqual(new Set(['a', 'b']));
  });

  it('removes the key when present', () => {
    const next = computeToggledFavorites(new Set(['a', 'b']), 'a');
    expect(next).toEqual(new Set(['b']));
  });

  it('returns a fresh Set (no mutation of input)', () => {
    const original = new Set(['a']);
    const next = computeToggledFavorites(original, 'b');
    expect(original).toEqual(new Set(['a']));
    expect(next).not.toBe(original);
  });

  it('idempotent: toggle twice equals start', () => {
    const start = new Set(['a', 'b']);
    const once = computeToggledFavorites(start, 'c');
    const twice = computeToggledFavorites(once, 'c');
    expect(twice).toEqual(start);
  });
});
