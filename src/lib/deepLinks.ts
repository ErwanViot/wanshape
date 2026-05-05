import { App } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';
import { router } from '../router.tsx';
import { isNative } from './capacitor.ts';
import { urlToRouterPath } from './deep-link-parse.ts';

export async function registerDeepLinkListener(): Promise<PluginListenerHandle | null> {
  if (!isNative()) return null;

  return App.addListener('appUrlOpen', (event) => {
    const path = urlToRouterPath(event.url);
    void router.navigate(path);
  });
}
