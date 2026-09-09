import { describe, expect, it } from 'vitest';
import { getConsigneForWeek, weeksFromConsigneKey } from './coaching.ts';

describe('weeksFromConsigneKey', () => {
  it('parses single weeks and ranges', () => {
    expect(weeksFromConsigneKey('3')).toEqual([3]);
    expect(weeksFromConsigneKey('1-4')).toEqual([1, 2, 3, 4]);
  });

  it('parses comma lists and mixed keys like the edge validator', () => {
    expect(weeksFromConsigneKey('9,10,11,12')).toEqual([9, 10, 11, 12]);
    expect(weeksFromConsigneKey('1,3-5')).toEqual([1, 3, 4, 5]);
    expect(weeksFromConsigneKey('9, 10 , 11')).toEqual([9, 10, 11]);
  });

  it('ignores malformed parts', () => {
    expect(weeksFromConsigneKey('5-2')).toEqual([]);
    expect(weeksFromConsigneKey('a,2')).toEqual([2]);
  });
});

describe('getConsigneForWeek', () => {
  const consignes = { '1-4': 'Reprise', '5,6': 'Développement', '7-8': 'Pic', '9': 'Affûtage' };

  it('resolves ranges, lists and single weeks', () => {
    expect(getConsigneForWeek(consignes, 2)).toBe('Reprise');
    expect(getConsigneForWeek(consignes, 6)).toBe('Développement');
    expect(getConsigneForWeek(consignes, 8)).toBe('Pic');
    expect(getConsigneForWeek(consignes, 9)).toBe('Affûtage');
  });

  it('returns null when nothing covers the week or consignes are missing', () => {
    expect(getConsigneForWeek(consignes, 12)).toBeNull();
    expect(getConsigneForWeek(null, 1)).toBeNull();
  });
});
