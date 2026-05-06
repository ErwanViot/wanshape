// Single source of truth for the URL/path scrubbing rules used by both
// Sentry (`sentryReport.ts`) and PostHog (`analytics.ts`). Adding a new
// pattern (e.g. a new id format that ends up in slugs) only needs an edit
// here — both reporters pick it up automatically.
//
// Scrub rules:
//   - UUID v4 (any case) → `:uuid`
//   - YYYYMMDD date inside a path segment → `:date`
//   - Open Food Facts barcode (8–14 digits) → `:barcode`
export function scrubPathIds(value: string): string {
  return value
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':uuid')
    .replace(/\/(?:19|20)\d{6}(?=\/|$|\?|#)/g, '/:date')
    .replace(/\/product\/\d{8,14}(?=\/|$|\?|#)/g, '/product/:barcode');
}
