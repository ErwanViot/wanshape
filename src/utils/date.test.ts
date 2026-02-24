import { describe, it, expect } from 'vitest';
import {
  formatDateToDDMMYYYY,
  parseDDMMYYYY,
  formatDuration,
  formatDurationLong,
} from './date.ts';

describe('formatDateToDDMMYYYY', () => {
  it('formats a date correctly', () => {
    expect(formatDateToDDMMYYYY(new Date(2026, 1, 24))).toBe('24022026');
  });

  it('pads single-digit day and month', () => {
    expect(formatDateToDDMMYYYY(new Date(2026, 0, 5))).toBe('05012026');
  });
});

describe('parseDDMMYYYY', () => {
  it('parses a DDMMYYYY string to Date', () => {
    const d = parseDDMMYYYY('24022026');
    expect(d.getDate()).toBe(24);
    expect(d.getMonth()).toBe(1); // Feb = 1
    expect(d.getFullYear()).toBe(2026);
  });

  it('roundtrips with formatDateToDDMMYYYY', () => {
    const original = new Date(2025, 11, 31);
    const key = formatDateToDDMMYYYY(original);
    const parsed = parseDDMMYYYY(key);
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
