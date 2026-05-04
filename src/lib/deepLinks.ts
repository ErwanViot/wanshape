import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { router } from '../router.tsx';
import { isNative } from './capacitor.ts';

// Convert any incoming deep link into a router path.
// Supported schemes:
//   wan2fit://reset-password?token=xxx        → /reset-password?token=xxx
//   https://wan2fit.fr/upgrade?session=xxx    → /upgrade?session=xxx (Universal Link)
// Anything we cannot parse falls through to the home route so the user is
// never stuck on a black screen.
function urlToRouterPath(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.pathname || '/'}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
}

export async function registerDeepLinkListener(): Promise<PluginListenerHandle | null> {
  if (!isNative()) return null;

  return App.addListener('appUrlOpen', (event) => {
    const path = urlToRouterPath(event.url);
    void router.navigate(path);
  });
}
