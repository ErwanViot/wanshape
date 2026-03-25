import { describe, expect, it } from 'vitest';
import { formatDateKey, formatDuration, formatDurationLong, parseDateKey } from './date.ts';

describe('formatDateKey', () => {
  it('formats a date correctly', () => {
    expect(formatDateKey(new Date(2026, 1, 24))).toBe('20260224');
  });

  it('pads single-digit day and month', () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('20260105');
  });
});

describe('parseDateKey', () => {
  it('parses a YYYYMMDD string to Date', () => {
    const d = parseDateKey('20260224');
    expect(d.getDate()).toBe(24);
    expect(d.getMonth()).toBe(1); // Feb = 1
    expect(d.getFullYear()).toBe(2026);
  });

  it('roundtrips with formatDateKey', () => {
    const original = new Date(2025, 11, 31);
    const key = formatDateKey(original);
    const parsed = parseDateKey(key);
    expect(parsed.getDate()).toBe(31);
    expect(parsed.getMonth()).toBe(11);
    expect(parsed.getFullYear()).toBe(2025);
  });
});

describe('formatDuration', () => {
  it('formats 0 seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats seconds < 60', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats exact minutes', () => {
    expect(formatDuration(300)).toBe('5:00');
  });
});

describe('formatDurationLong', () => {
  it('formats short durations as seconds', () => {
    expect(formatDurationLong(30)).toBe('30s');
  });

  it('formats exact minutes without seconds', () => {
    expect(formatDurationLong(120)).toBe('2 min');
  });

  it('formats minutes + seconds', () => {
    expect(formatDurationLong(90)).toBe('1min 30s');
  });
});
