export interface TextEstimate {
  name: string;
  calories: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  confidence: 'low' | 'medium' | 'high';
}

export interface OverflowInsight {
  summary: string;
  suggestions: string[];
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

function isPositiveNumber(v: unknown, max: number): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
}

function isOptionalPositive(v: unknown, max: number): v is number | null {
  if (v === null) return true;
  return isPositiveNumber(v, max);
}

export function validateTextEstimate(json: unknown): ValidationResult<TextEstimate> {
  if (!json || typeof json !== 'object') return { ok: false, error: 'not_object' };
  const obj = json as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!name) return { ok: false, error: 'missing_name' };
  if (name.length > 120) return { ok: false, error: 'name_too_long' };
  if (!isPositiveNumber(obj.calories, 5000)) return { ok: false, error: 'invalid_calories' };
  // Tight per-meal macro caps (500 g) catch gross hallucinations without
  // rejecting legitimate outliers (bodybuilder protein shake etc.).
  if (!isOptionalPositive(obj.protein_g, 500)) return { ok: false, error: 'invalid_protein' };
  if (!isOptionalPositive(obj.carbs_g, 500)) return { ok: false, error: 'invalid_carbs' };
  if (!isOptionalPositive(obj.fat_g, 500)) return { ok: false, error: 'invalid_fat' };
  const confidence = obj.confidence;
  if (confidence !== 'low' && confidence !== 'medium' && confidence !== 'high') {
    return { ok: false, error: 'invalid_confidence' };
  }
  return {
    ok: true,
    value: {
      name,
      calories: Math.round((obj.calories as number) * 10) / 10,
      protein_g: obj.protein_g === null ? null : Math.round((obj.protein_g as number) * 10) / 10,
      carbs_g: obj.carbs_g === null ? null : Math.round((obj.carbs_g as number) * 10) / 10,
      fat_g: obj.fat_g === null ? null : Math.round((obj.fat_g as number) * 10) / 10,
      confidence,
    },
  };
}

export function validateOverflowInsight(json: unknown): ValidationResult<OverflowInsight> {
  if (!json || typeof json !== 'object') return { ok: false, error: 'not_object' };
  const obj = json as Record<string, unknown>;
  const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
  if (!summary) return { ok: false, error: 'missing_summary' };
  if (summary.length > 2000) return { ok: false, error: 'summary_too_long' };
  const suggestions = Array.isArray(obj.suggestions) ? obj.suggestions : [];
  const cleaned: string[] = [];
  for (const s of suggestions) {
    if (typeof s !== 'string') continue;
    const trimmed = s.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length > 300) continue;
    cleaned.push(trimmed);
    if (cleaned.length >= 3) break;
  }
  return { ok: true, value: { summary, suggestions: cleaned } };
}
