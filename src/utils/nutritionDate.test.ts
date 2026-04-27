import { describe, expect, it } from 'vitest';
import { formatDateLabel, formatLocalYYYYMMDD, parseYYYYMMDD, shiftYYYYMMDD } from './nutritionDate.ts';

describe('formatLocalYYYYMMDD', () => {
  it('uses local getters, not UTC', () => {
    // Construct a local date; explicit fields to pin the result.
    const d = new Date(2026, 3, 17); // 2026-04-17 local
    expect(formatLocalYYYYMMDD(d)).toBe('20260417');
  });

  it('pads month and day', () => {
    const d = new Date(2026, 0, 5); // 2026-01-05 local
    expect(formatLocalYYYYMMDD(d)).toBe('20260105');
  });
});

describe('parseYYYYMMDD', () => {
  it('parses a valid date', () => {
    const d = parseYYYYMMDD('20260417');
    expect(d?.getFullYear()).toBe(2026);
    expect(d?.getMonth()).toBe(3);
    expect(d?.getDate()).toBe(17);
  });

  it('rejects invalid format', () => {
    expect(parseYYYYMMDD('2026-04-17')).toBeNull();
    expect(parseYYYYMMDD('abc')).toBeNull();
    expect(parseYYYYMMDD('')).toBeNull();
  });

  it('rejects overflowed day (e.g. Feb 30)', () => {
    expect(parseYYYYMMDD('20260230')).toBeNull();
  });
});

describe('shiftYYYYMMDD', () => {
  it('shifts forward and backward', () => {
    expect(shiftYYYYMMDD('20260417', 1)).toBe('20260418');
    expect(shiftYYYYMMDD('20260417', -1)).toBe('20260416');
  });

  it('rolls over month boundaries', () => {
    expect(shiftYYYYMMDD('20260430', 1)).toBe('20260501');
    expect(shiftYYYYMMDD('20260301', -1)).toBe('20260228');
  });

  it('returns null for invalid input', () => {
    expect(shiftYYYYMMDD('bad', 1)).toBeNull();
  });
});

describe('formatDateLabel', () => {
  const now = new Date(2026, 3, 17); // 2026-04-17

  it('returns default French today/yesterday/tomorrow when no labels provided', () => {
    expect(formatDateLabel('20260417', { now })).toBe("aujourd'hui");
    expect(formatDateLabel('20260416', { now })).toBe('hier');
    expect(formatDateLabel('20260418', { now })).toBe('demain');
  });

  it('uses provided labels when caller supplies them', () => {
    const labels = { today: 'today', yesterday: 'yesterday', tomorrow: 'tomorrow' };
    expect(formatDateLabel('20260417', { now, labels })).toBe('today');
    expect(formatDateLabel('20260416', { now, labels })).toBe('yesterday');
    expect(formatDateLabel('20260418', { now, labels })).toBe('tomorrow');
  });

  it('falls back to localized short date for other dates', () => {
    const label = formatDateLabel('20260410', { now, locale: 'fr' });
    expect(label).toMatch(/avr/i);
  });

  it('formats short date with provided locale', () => {
    const label = formatDateLabel('20260410', { now, locale: 'en' });
    expect(label).toMatch(/apr/i);
  });
});
