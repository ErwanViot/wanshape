/**
 * Pure parsers for CIQUAL (ANSES) CSV files. Testable in isolation.
 * No Supabase / fs access here; consumed by scripts/seed-food-reference.ts.
 */

export const CIQUAL_COLUMN_MAP = {
  id: 'alim_code',
  name: 'alim_nom_fr',
  group: 'alim_grp_nom_fr',
  calories: 'Energie, Règlement UE N° 1169/2011 (kcal/100 g)',
  protein: 'Protéines, N x 6.25 (g/100 g)',
  carbs: 'Glucides (g/100 g)',
  fat: 'Lipides (g/100 g)',
  fiber: 'Fibres alimentaires (g/100 g)',
} as const;

export type CiqualColumnKey = keyof typeof CIQUAL_COLUMN_MAP;

export type FoodReferenceRow = {
  id: string;
  name_fr: string;
  group_fr: string | null;
  calories_100g: number | null;
  protein_100g: number | null;
  carbs_100g: number | null;
  fat_100g: number | null;
  fiber_100g: number | null;
  source: 'ciqual';
};

/**
 * Parses a single CSV line respecting double-quote escaping.
 * CIQUAL uses `;` as separator and may wrap fields containing spaces in quotes.
 */
export function parseCsvLine(line: string, separator = ';'): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === separator && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Converts a CIQUAL numeric field to `number | null`.
 * Returns null for missing markers: "-", "traces", "< X", empty string.
 * Handles French decimal comma and non-breaking spaces used as thousand separators.
 */
export function parseCiqualNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'traces') return null;
  if (trimmed.startsWith('<')) return null;
  const normalized = trimmed.replace(',', '.').replace(/\s+/g, '');
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

/**
 * Splits raw CSV content into header row + data rows. Strips UTF-8 BOM if present.
 */
export function splitCsv(content: string): { headers: string[]; rows: string[][] } {
  const cleaned = content.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row');
  }
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((l) => parseCsvLine(l));
  return { headers, rows };
}

/**
 * Resolves the index of each expected CIQUAL column within the CSV headers.
 * Throws a descriptive error listing the available headers if one is missing.
 */
export function buildColumnIndex(headers: string[]): Record<CiqualColumnKey, number> {
  const indexes = {} as Record<CiqualColumnKey, number>;
  for (const [key, header] of Object.entries(CIQUAL_COLUMN_MAP) as Array<[CiqualColumnKey, string]>) {
    const idx = headers.indexOf(header);
    if (idx < 0) {
      throw new Error(`CSV header missing: "${header}". Found: ${headers.slice(0, 10).join(' | ')} (...)`);
    }
    indexes[key] = idx;
  }
  return indexes;
}

/**
 * Maps a raw CSV row to a FoodReferenceRow. Returns null when the row is missing
 * a required field (id or name).
 */
export function mapRow(row: string[], idx: Record<CiqualColumnKey, number>): FoodReferenceRow | null {
  const id = row[idx.id]?.trim();
  const name = row[idx.name]?.trim();
  if (!id || !name) return null;
  return {
    id,
    name_fr: name,
    group_fr: row[idx.group]?.trim() || null,
    calories_100g: parseCiqualNumber(row[idx.calories]),
    protein_100g: parseCiqualNumber(row[idx.protein]),
    carbs_100g: parseCiqualNumber(row[idx.carbs]),
    fat_100g: parseCiqualNumber(row[idx.fat]),
    fiber_100g: parseCiqualNumber(row[idx.fiber]),
    source: 'ciqual',
  };
}
