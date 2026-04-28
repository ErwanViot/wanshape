import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOpenFoodFactsProduct } from './openFoodFacts.ts';
import { captureException } from './sentryReport.ts';

vi.mock('./sentryReport.ts', () => ({
  captureException: vi.fn(),
}));

const realFetch = globalThis.fetch;

function mockFetch(response: Partial<Response> & { _json?: unknown }): typeof fetch {
  return vi.fn(async () => {
    return {
      ok: response.ok ?? true,
      status: response.status ?? 200,
      json: async () => response._json,
      ...response,
    } as Response;
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(captureException).mockClear();
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('fetchOpenFoodFactsProduct', () => {
  it('returns invalid_barcode for non-numeric or wrong-length input', async () => {
    const r1 = await fetchOpenFoodFactsProduct('abc');
    expect(r1.error).toBe('invalid_barcode');
    const r2 = await fetchOpenFoodFactsProduct('123');
    expect(r2.error).toBe('invalid_barcode');
    const r3 = await fetchOpenFoodFactsProduct('123456789012345');
    expect(r3.error).toBe('invalid_barcode');
  });

  it('parses a valid OFF response with French-localized name', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Nutella',
          product_name_fr: 'Pâte à tartiner Nutella',
          brands: 'Ferrero,Ferrero France',
          quantity: '400g',
          image_small_url: 'https://example.test/img.jpg',
          nutriments: {
            'energy-kcal_100g': 539,
            proteins_100g: 6.3,
            carbohydrates_100g: 57.5,
            fat_100g: 30.9,
            fiber_100g: 4.2,
          },
        },
      },
    });

    const { product, error } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(error).toBeNull();
    expect(product?.name).toBe('Pâte à tartiner Nutella');
    expect(product?.brand).toBe('Ferrero');
    expect(product?.calories_100g).toBe(539);
    expect(product?.protein_100g).toBeCloseTo(6.3);
    expect(product?.image_url).toBe('https://example.test/img.jpg');
    expect(product?.source_url).toBe('https://world.openfoodfacts.org/product/3017620422003');
  });

  it('returns missing_nutrition when product has no kcal', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Item sans nutrition',
          nutriments: {},
        },
      },
    });
    const { product, error } = await fetchOpenFoodFactsProduct('3000000000001');
    expect(product).toBeNull();
    expect(error).toBe('missing_nutrition');
  });

  it('returns not_found when OFF reports status 0', async () => {
    globalThis.fetch = mockFetch({ _json: { status: 0 } });
    const { product, error } = await fetchOpenFoodFactsProduct('9999999999999');
    expect(product).toBeNull();
    expect(error).toBe('not_found');
  });

  it('returns not_found on HTTP 404', async () => {
    globalThis.fetch = mockFetch({ ok: false, status: 404, _json: {} });
    const { error } = await fetchOpenFoodFactsProduct('9999999999999');
    expect(error).toBe('not_found');
  });

  it('returns network on fetch throw and reports to Sentry', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError('network unreachable');
    }) as unknown as typeof fetch;
    const { error } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(error).toBe('network');
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('treats AbortError as a silent cancellation, no Sentry report', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }) as unknown as typeof fetch;
    const { product, error } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product).toBeNull();
    expect(error).toBeNull();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('reports HTTP 5xx to Sentry but not 404', async () => {
    globalThis.fetch = mockFetch({ ok: false, status: 503, _json: {} });
    const { error } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(error).toBe('network');
    expect(captureException).toHaveBeenCalledTimes(1);

    vi.mocked(captureException).mockClear();
    globalThis.fetch = mockFetch({ ok: false, status: 404, _json: {} });
    const r = await fetchOpenFoodFactsProduct('9999999999999');
    expect(r.error).toBe('not_found');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('accepts 8-digit EAN-8', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Produit court',
          nutriments: { 'energy-kcal_100g': 250 },
        },
      },
    });
    const { product } = await fetchOpenFoodFactsProduct('12345678');
    expect(product?.name).toBe('Produit court');
  });

  it('accepts 12-digit UPC-A', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'US import',
          nutriments: { 'energy-kcal_100g': 100 },
        },
      },
    });
    const { product, error } = await fetchOpenFoodFactsProduct('012345678905');
    expect(error).toBeNull();
    expect(product?.name).toBe('US import');
  });

  it('returns missing_nutrition when name is empty even if calories exist', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: '',
          nutriments: { 'energy-kcal_100g': 250 },
        },
      },
    });
    const { product, error } = await fetchOpenFoodFactsProduct('3000000000001');
    expect(product).toBeNull();
    expect(error).toBe('missing_nutrition');
  });

  it('classifies json() parse failure as network and reports to Sentry', async () => {
    globalThis.fetch = vi.fn(
      async () =>
        ({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected end of JSON input');
          },
        }) as unknown as Response,
    ) as unknown as typeof fetch;
    const { product, error } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product).toBeNull();
    expect(error).toBe('network');
    expect(captureException).toHaveBeenCalledTimes(1);
  });
});
