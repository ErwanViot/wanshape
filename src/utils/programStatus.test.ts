import { describe, expect, it } from 'vitest';
import { effectiveProgramStatus, isActiveProgram, isStaleGenerating, STALE_GENERATION_MS } from './programStatus.ts';

const NOW = Date.parse('2026-09-02T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW - m * 60_000).toISOString();

describe('programStatus', () => {
  it('treats a legacy row without status as ready', () => {
    expect(effectiveProgramStatus({}, NOW)).toBe('ready');
    expect(isActiveProgram({}, NOW)).toBe(true);
  });

  it('keeps a fresh generating row as generating', () => {
    const p = { status: 'generating' as const, generation_started_at: minutesAgo(2) };
    expect(isStaleGenerating(p, NOW)).toBe(false);
    expect(effectiveProgramStatus(p, NOW)).toBe('generating');
    expect(isActiveProgram(p, NOW)).toBe(true);
  });

  it('flags a generating row older than the threshold as failed', () => {
    const p = { status: 'generating' as const, generation_started_at: minutesAgo(9) };
    expect(isStaleGenerating(p, NOW)).toBe(true);
    expect(effectiveProgramStatus(p, NOW)).toBe('failed');
    expect(isActiveProgram(p, NOW)).toBe(false);
  });

  it('uses the exact threshold boundary', () => {
    const boundary = new Date(NOW - STALE_GENERATION_MS).toISOString();
    expect(isStaleGenerating({ status: 'generating', generation_started_at: boundary }, NOW)).toBe(false);
  });

  it('never marks a generating row stale without a start timestamp', () => {
    expect(isStaleGenerating({ status: 'generating', generation_started_at: null }, NOW)).toBe(false);
    expect(isStaleGenerating({ status: 'generating', generation_started_at: 'not-a-date' }, NOW)).toBe(false);
  });

  it('leaves ready and failed untouched', () => {
    expect(effectiveProgramStatus({ status: 'ready', generation_started_at: minutesAgo(30) }, NOW)).toBe('ready');
    expect(effectiveProgramStatus({ status: 'failed' }, NOW)).toBe('failed');
    expect(isActiveProgram({ status: 'failed' }, NOW)).toBe(false);
  });
});
