// Convert any incoming deep link into a router path.
// Supported schemes:
//   wan2fit://reset-password?token=xxx        → /reset-password?token=xxx
//   https://wan2fit.fr/upgrade?session=xxx    → /upgrade?session=xxx (Universal Link)
// Note: WHATWG URL parses non-special schemes (custom like wan2fit://) by
// putting the segment after :// in `host`, leaving `pathname` empty. We
// rebuild the route from host + pathname for those cases. Anything we
// cannot parse falls through to '/' so users never land on a black screen.
//
// Lives in its own module so unit tests can import it without dragging
// the router (and its lazy-loaded auth context + i18n) into the test
// bundle.
export function urlToRouterPath(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const isHttp = parsed.protocol === 'https:' || parsed.protocol === 'http:';
    const route = isHttp ? parsed.pathname || '/' : `/${parsed.host}${parsed.pathname}`.replace(/\/{2,}/g, '/') || '/';
    return `${route}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}
