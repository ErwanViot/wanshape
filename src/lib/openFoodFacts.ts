/**
 * Open Food Facts public API wrapper.
 *
 * Licence: Open Database License (ODbL). Attribution requirement: display
 * "via Open Food Facts" whenever we surface product data fetched from OFF.
 * Docs: https://openfoodfacts.github.io/openfoodfacts-server/api/
 *
 * Requests are issued from the user's browser directly (no proxy). The API is
 * public, rate limits are generous (~100 req/min), and we never send user
 * credentials.
 */

import { captureException } from './sentryReport.ts';

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const FIELDS = [
  'product_name',
  'product_name_fr',
  'brands',
  'quantity',
  'product_quantity',
  'serving_size',
  'serving_quantity',
  'nutriments',
  'image_small_url',
].join(',');

export interface OpenFoodFactsProduct {
  barcode: string;
  name: string;
  brand: string | null;
  /** Human-readable total quantity, e.g. "40 g", "1 L", "270 g (3 x 90g)". */
  quantity: string | null;
  /** Numeric total package weight in grams, when OFF reports it. */
  product_quantity_g: number | null;
  /** Numeric weight of one serving in grams, when OFF reports it. */
  serving_quantity_g: number | null;
  /** kcal per 100g when available, null if unit is kJ only or missing. */
  calories_100g: number | null;
  protein_100g: number | null;
  carbs_100g: number | null;
  fat_100g: number | null;
  fiber_100g: number | null;
  image_url: string | null;
  source_url: string;
}

export type OpenFoodFactsError = 'not_found' | 'network' | 'invalid_barcode' | 'missing_nutrition';

export interface OpenFoodFactsResult {
  product: OpenFoodFactsProduct | null;
  error: OpenFoodFactsError | null;
}

/**
 * Accepts barcode lengths matching real standards only:
 * EAN-8 (8), UPC-A (12), EAN-13 (13), ITF-14 (14). UPC-E is normalized to 8 by
 * scanners. Rejects exotic lengths (9/10/11) that would always miss OFF anyway.
 */
function isValidBarcode(barcode: string): boolean {
  return /^[0-9]+$/.test(barcode) && [8, 12, 13, 14].includes(barcode.length);
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const raw = source[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const n = Number.parseFloat(raw);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

/**
 * Fetches a product by barcode. Returns null + error code on any failure so
 * the UI can surface a user-friendly message (never throws).
 */
export async function fetchOpenFoodFactsProduct(barcode: string, signal?: AbortSignal): Promise<OpenFoodFactsResult> {
  if (!isValidBarcode(barcode)) {
    return { product: null, error: 'invalid_barcode' };
  }

  let response: Response;
  try {
    response = await fetch(`${OFF_BASE}/${barcode}?fields=${FIELDS}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (err) {
    // Aborts come from the consumer (component unmount, scan another) and are
    // not user-facing failures — surface no error so the UI stays clean.
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { product: null, error: null };
    }
    // Real network failure: log the cause so we can tell connectivity loss
    // apart from content-blocker / privacy-relay drops in Sentry.
    captureException(err, { contexts: { off_fetch: { phase: 'fetch_throw' } } });
    return { product: null, error: 'network' };
  }

  if (!response.ok) {
    if (response.status !== 404) {
      captureException(new Error(`OFF http ${response.status}`), {
        contexts: { off_fetch: { phase: 'http_error', status: response.status } },
      });
    }
    return { product: null, error: response.status === 404 ? 'not_found' : 'network' };
  }

  type OffPayload = {
    status?: number;
    product?: {
      product_name?: string;
      product_name_fr?: string;
      brands?: string;
      quantity?: string;
      product_quantity?: number | string;
      serving_size?: string;
      serving_quantity?: number | string;
      nutriments?: Record<string, unknown>;
      image_small_url?: string;
    };
  };
  // json() can throw on truncated / non-JSON 200s (content-blocker
  // injections, captive portals). That is a transport failure, not a
  // missing product — surface it as 'network' so the UI message and the
  // Sentry breadcrumb stay accurate.
  let payload: OffPayload;
  try {
    payload = (await response.json()) as OffPayload;
  } catch (err) {
    captureException(err, { contexts: { off_fetch: { phase: 'json_parse' } } });
    return { product: null, error: 'network' };
  }

  if (payload.status !== 1 || !payload.product) {
    return { product: null, error: 'not_found' };
  }

  const p = payload.product;
  const nutr = p.nutriments ?? {};
  const name = p.product_name_fr?.trim() || p.product_name?.trim() || null;
  // Only accept kcal-typed keys; `energy_100g` is in kJ on OFF and would
  // otherwise inflate calories by ~4.184x with no unit check.
  const calories = pickNumber(nutr, ['energy-kcal_100g', 'energy-kcal']);

  if (!name || calories == null) {
    return { product: null, error: 'missing_nutrition' };
  }

  // OFF often returns these as numeric strings (e.g. "40"); pickNumber
  // coerces both shapes uniformly. Negative or zero values are treated as
  // missing — they're never meaningful as a portion default.
  const productQtyRaw = pickNumber(p as unknown as Record<string, unknown>, ['product_quantity']);
  const servingQtyRaw = pickNumber(p as unknown as Record<string, unknown>, ['serving_quantity']);

  return {
    product: {
      barcode,
      name,
      brand: p.brands ? p.brands.split(',')[0].trim() : null,
      quantity: p.quantity ?? null,
      product_quantity_g: productQtyRaw && productQtyRaw > 0 ? productQtyRaw : null,
      serving_quantity_g: servingQtyRaw && servingQtyRaw > 0 ? servingQtyRaw : null,
      calories_100g: calories,
      protein_100g: pickNumber(nutr, ['proteins_100g', 'proteins']),
      carbs_100g: pickNumber(nutr, ['carbohydrates_100g', 'carbohydrates']),
      fat_100g: pickNumber(nutr, ['fat_100g', 'fat']),
      fiber_100g: pickNumber(nutr, ['fiber_100g', 'fiber']),
      image_url: p.image_small_url ?? null,
      source_url: `https://world.openfoodfacts.org/product/${barcode}`,
    },
    error: null,
  };
}
