import { describe, expect, it } from 'vitest';
import {
  CIQUAL_COLUMN_MAP,
  buildColumnIndex,
  mapRow,
  parseCiqualNumber,
  parseCsvLine,
  splitCsv,
} from './ciqualParser.ts';

describe('parseCsvLine', () => {
  it('splits on the default separator `;`', () => {
    expect(parseCsvLine('a;b;c')).toEqual(['a', 'b', 'c']);
  });

  it('preserves empty trailing fields', () => {
    expect(parseCsvLine('a;;c')).toEqual(['a', '', 'c']);
    expect(parseCsvLine('a;b;')).toEqual(['a', 'b', '']);
  });

  it('ignores separator inside double-quoted fields', () => {
    expect(parseCsvLine('"foo;bar";baz')).toEqual(['foo;bar', 'baz']);
  });

  it('handles escaped double quotes inside quoted fields', () => {
    expect(parseCsvLine('"he said ""hi""";next')).toEqual(['he said "hi"', 'next']);
  });
});

describe('parseCiqualNumber', () => {
  it('parses French decimal comma', () => {
    expect(parseCiqualNumber('12,5')).toBe(12.5);
  });

  it('parses plain integers', () => {
    expect(parseCiqualNumber('342')).toBe(342);
  });

  it('returns null for CIQUAL missing markers', () => {
    expect(parseCiqualNumber('-')).toBeNull();
    expect(parseCiqualNumber('traces')).toBeNull();
    expect(parseCiqualNumber('Traces')).toBeNull();
    expect(parseCiqualNumber('< 0,1')).toBeNull();
    expect(parseCiqualNumber('')).toBeNull();
    expect(parseCiqualNumber(undefined)).toBeNull();
  });

  it('strips whitespace and non-breaking thousand separators', () => {
    expect(parseCiqualNumber('1 234,5')).toBe(1234.5);
    expect(parseCiqualNumber('  98,6  ')).toBe(98.6);
  });

  it('returns null for garbage', () => {
    expect(parseCiqualNumber('n/a')).toBeNull();
  });
});

describe('splitCsv', () => {
  it('extracts headers and rows', () => {
    const content = 'a;b;c\n1;2;3\n4;5;6';
    const { headers, rows } = splitCsv(content);
    expect(headers).toEqual(['a', 'b', 'c']);
    expect(rows).toEqual([
      ['1', '2', '3'],
      ['4', '5', '6'],
    ]);
  });

  it('strips UTF-8 BOM', () => {
    const content = '\uFEFFa;b\n1;2';
    const { headers } = splitCsv(content);
    expect(headers).toEqual(['a', 'b']);
  });

  it('accepts CRLF line endings', () => {
    const content = 'a;b\r\n1;2';
    const { rows } = splitCsv(content);
    expect(rows).toEqual([['1', '2']]);
  });

  it('throws when no data rows', () => {
    expect(() => splitCsv('a;b\n')).toThrow();
  });
});

describe('buildColumnIndex + mapRow', () => {
  const headers = [
    'alim_code',
    'alim_nom_fr',
    'alim_grp_nom_fr',
    'Energie, Règlement UE N° 1169/2011 (kcal/100 g)',
    'Protéines, N x 6.25 (g/100 g)',
    'Glucides (g/100 g)',
    'Lipides (g/100 g)',
    'Fibres alimentaires (g/100 g)',
  ];

  it('resolves all expected column indexes', () => {
    const idx = buildColumnIndex(headers);
    expect(idx.id).toBe(0);
    expect(idx.name).toBe(1);
    expect(idx.fiber).toBe(7);
  });

  it('throws with a helpful message when a column is missing', () => {
    const broken = headers.filter((h) => h !== CIQUAL_COLUMN_MAP.calories);
    expect(() => buildColumnIndex(broken)).toThrow(/CSV header missing/);
  });

  it('tolerates minor whitespace and case variants in header labels', () => {
    const variant = [
      'ALIM_CODE',
      'alim_nom_fr',
      'alim_grp_nom_fr',
      'Energie,  Règlement UE  N°  1169/2011  (kcal/100 g)', // double spaces
      'Protéines, N x 6.25 (g/100 g)',
      'Glucides (g/100 g)',
      'Lipides (g/100 g)',
      'Fibres alimentaires (g/100 g)',
    ];
    const idx = buildColumnIndex(variant);
    expect(idx.calories).toBe(3);
    expect(idx.id).toBe(0);
  });

  it('refuses a kJ energy column even if the rest of the label matches', () => {
    const kjHeaders = [...headers];
    kjHeaders[3] = 'Energie, Règlement UE N° 1169/2011 (kJ/100 g)';
    expect(() => buildColumnIndex(kjHeaders)).toThrow(/kJ|kcal/);
  });

  it('maps a valid CIQUAL row to a FoodReferenceRow', () => {
    const idx = buildColumnIndex(headers);
    const row = ['20001', 'Pomme golden, crue', 'fruits', '52,1', '0,3', '12,3', '0,1', '1,8'];
    const mapped = mapRow(row, idx);
    expect(mapped).toEqual({
      id: '20001',
      name_fr: 'Pomme golden, crue',
      group_fr: 'fruits',
      calories_100g: 52.1,
      protein_100g: 0.3,
      carbs_100g: 12.3,
      fat_100g: 0.1,
      fiber_100g: 1.8,
      source: 'ciqual',
    });
  });

  it('returns null for rows missing id or name', () => {
    const idx = buildColumnIndex(headers);
    expect(mapRow(['', 'Pomme', '', '', '', '', '', ''], idx)).toBeNull();
    expect(mapRow(['20001', '', '', '', '', '', '', ''], idx)).toBeNull();
  });

  it('converts "-" and "traces" to null in nutrition fields', () => {
    const idx = buildColumnIndex(headers);
    const row = ['20002', 'Eau', 'boissons', '-', 'traces', '-', '-', '-'];
    const mapped = mapRow(row, idx);
    expect(mapped?.calories_100g).toBeNull();
    expect(mapped?.protein_100g).toBeNull();
    expect(mapped?.fiber_100g).toBeNull();
    expect(mapped?.name_fr).toBe('Eau');
  });
});
