import { isNative } from './capacitor.ts';

const PRODUCTION_ORIGIN = 'https://wan2fit.fr';

// Build a redirect URL that survives the Supabase email round-trip.
// On web we keep window.location.origin so dev/preview URLs (Vercel preview
// deployments) work without extra config. On native we always send users to
// the production domain — Apple's AASA + Android's assetlinks reroute the
// click back into the installed app via the deep-link listener.
export function getAuthRedirectUrl(path: string): string {
  if (isNative()) return `${PRODUCTION_ORIGIN}${path}`;
  return `${window.location.origin}${path}`;
}
