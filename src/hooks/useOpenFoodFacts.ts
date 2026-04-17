import { useCallback, useRef, useState } from 'react';
import { fetchOpenFoodFactsProduct, type OpenFoodFactsError, type OpenFoodFactsProduct } from '../lib/openFoodFacts.ts';

export interface UseOpenFoodFactsResult {
  product: OpenFoodFactsProduct | null;
  loading: boolean;
  error: OpenFoodFactsError | null;
  fetchByBarcode: (barcode: string) => Promise<OpenFoodFactsProduct | null>;
  reset: () => void;
}

export function useOpenFoodFacts(): UseOpenFoodFactsResult {
  const [product, setProduct] = useState<OpenFoodFactsProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<OpenFoodFactsError | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchByBarcode = useCallback(async (barcode: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setProduct(null);
    try {
      const { product: p, error: err } = await fetchOpenFoodFactsProduct(barcode, controller.signal);
      if (controller.signal.aborted) return null;
      setProduct(p);
      setError(err);
      return p;
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProduct(null);
    setError(null);
    setLoading(false);
  }, []);

  return { product, loading, error, fetchByBarcode, reset };
}
