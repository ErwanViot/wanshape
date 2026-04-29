import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchOpenFoodFactsProduct, searchOpenFoodFactsProducts } from './openFoodFacts.ts';
import { captureException } from './sentryReport.ts';

vi.mock('./sentryReport.ts', () => ({
  captureException: vi.fn(),
}));

const invokeMock = vi.fn();
vi.mock('./supabase.ts', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => invokeMock(...args),
    },
  },
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

  it('extracts numeric product_quantity and serving_quantity when OFF returns them', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Barre céréales',
          quantity: '40 g',
          product_quantity: 40,
          serving_quantity: 40,
          nutriments: { 'energy-kcal_100g': 420 },
        },
      },
    });
    const { product } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product?.product_quantity_g).toBe(40);
    expect(product?.serving_quantity_g).toBe(40);
  });

  it('coerces string-typed numeric quantities (OFF often serializes them as strings)', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Yaourt',
          product_quantity: '500',
          serving_quantity: '125',
          nutriments: { 'energy-kcal_100g': 60 },
        },
      },
    });
    const { product } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product?.product_quantity_g).toBe(500);
    expect(product?.serving_quantity_g).toBe(125);
  });

  it('drops zero / negative quantities to null so the UI falls back to a sane default', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Produit incomplet',
          product_quantity: 0,
          serving_quantity: -1,
          nutriments: { 'energy-kcal_100g': 100 },
        },
      },
    });
    const { product } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product?.product_quantity_g).toBeNull();
    expect(product?.serving_quantity_g).toBeNull();
  });

  it('returns null for missing quantity fields rather than NaN', async () => {
    globalThis.fetch = mockFetch({
      _json: {
        status: 1,
        product: {
          product_name: 'Ancien produit',
          nutriments: { 'energy-kcal_100g': 100 },
        },
      },
    });
    const { product } = await fetchOpenFoodFactsProduct('3017620422003');
    expect(product?.product_quantity_g).toBeNull();
    expect(product?.serving_quantity_g).toBeNull();
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

describe('searchOpenFoodFactsProducts', () => {
  beforeEach(() => {
    invokeMock.mockReset();
  });

  it('returns [] for queries shorter than 2 chars without invoking the edge function', async () => {
    const out = await searchOpenFoodFactsProducts('a', 8);
    expect(out).toEqual([]);
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('returns [] without invoking when the AbortSignal is already aborted', async () => {
    const ac = new AbortController();
    ac.abort();
    const out = await searchOpenFoodFactsProducts('foo', 8, ac.signal);
    expect(out).toEqual([]);
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it('maps edge-function hits into our internal shape (brands as array)', async () => {
    invokeMock.mockResolvedValue({
      data: {
        hits: [
          {
            code: '8718951288850',
            product_name: 'Desperados',
            brands: ['Desperados', 'Heineken'],
            quantity: '33 cl',
            product_quantity: 330,
            serving_quantity: 330,
            nutriments: {
              'energy-kcal_100g': 47,
              proteins_100g: 0.4,
              carbohydrates_100g: 5.2,
              fat_100g: 0,
            },
            image_small_url: 'https://example.test/desp.jpg',
          },
        ],
      },
      error: null,
    });
    const out = await searchOpenFoodFactsProducts('desperados', 8);
    expect(invokeMock).toHaveBeenCalledWith('off-search', {
      body: { q: 'desperados', page_size: 8 },
    });
    expect(out).toHaveLength(1);
    expect(out[0].barcode).toBe('8718951288850');
    expect(out[0].name).toBe('Desperados');
    expect(out[0].brand).toBe('Desperados');
    expect(out[0].calories_100g).toBe(47);
    expect(out[0].product_quantity_g).toBe(330);
    expect(out[0].source_url).toContain('8718951288850');
  });

  it('still parses brands when the proxy returns a comma-separated string', async () => {
    invokeMock.mockResolvedValue({
      data: {
        hits: [
          {
            code: '111',
            product_name: 'Test',
            brands: 'BrandA,BrandB',
            nutriments: { 'energy-kcal_100g': 50 },
          },
        ],
      },
      error: null,
    });
    const out = await searchOpenFoodFactsProducts('foo', 8);
    expect(out[0].brand).toBe('BrandA');
  });

  it('skips hits that lack name or kcal/100g', async () => {
    invokeMock.mockResolvedValue({
      data: {
        hits: [
          { code: '111', product_name: 'No kcal', nutriments: {} },
          { code: '222', product_name: '', nutriments: { 'energy-kcal_100g': 100 } },
          { code: '333', product_name: 'OK', nutriments: { 'energy-kcal_100g': 200 } },
        ],
      },
      error: null,
    });
    const out = await searchOpenFoodFactsProducts('foo', 8);
    expect(out.map((p) => p.barcode)).toEqual(['333']);
  });

  it('returns [] on AbortError without reporting to Sentry', async () => {
    invokeMock.mockRejectedValue(new DOMException('aborted', 'AbortError'));
    const out = await searchOpenFoodFactsProducts('foo', 8);
    expect(out).toEqual([]);
    expect(captureException).not.toHaveBeenCalled();
  });

  it('returns [] and reports to Sentry when the invoke call throws', async () => {
    invokeMock.mockRejectedValue(new TypeError('offline'));
    const out = await searchOpenFoodFactsProducts('foo', 8);
    expect(out).toEqual([]);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('returns [] and reports to Sentry on an edge-function-level error', async () => {
    invokeMock.mockResolvedValue({ data: null, error: { message: 'Upstream 502' } });
    const out = await searchOpenFoodFactsProducts('foo', 8);
    expect(out).toEqual([]);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it('caps page_size to 24 and treats undefined hits as empty', async () => {
    invokeMock.mockResolvedValue({ data: {}, error: null });
    const out = await searchOpenFoodFactsProducts('foo', 9999);
    expect(invokeMock).toHaveBeenCalledWith('off-search', {
      body: { q: 'foo', page_size: 24 },
    });
    expect(out).toEqual([]);
  });
});
