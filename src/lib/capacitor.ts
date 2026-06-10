import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

// capacitor.config.ts sets launchAutoHide: false so React controls the splash
// dismiss. If this call ever throws (plugin unavailable, race at boot), the
// splash would stay visible forever — swallow + log instead.
export async function hideNativeSplash(): Promise<void> {
  if (!isNative()) return;

  // Wait one animation frame so React paints the first route before we
  // start fading the native splash out — otherwise the user sees a
  // momentary black gap between the splash dismiss and the rendered UI.
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // 400ms feels noticeably softer than the default 200ms on physical
    // devices without lengthening total time-to-interactive.
    await SplashScreen.hide({ fadeOutDuration: 400 });
  } catch (err) {
    console.warn('[capacitor] hideNativeSplash failed', err);
  }
}

// iOS WKWebView auto-zooms when an input with font-size < 16px receives
// focus, and the page can stay stuck above 100% afterwards. Locking the
// viewport scale suppresses that behaviour. We do this at runtime for the
// NATIVE shell only: baking `user-scalable=no` into index.html would also
// disable pinch-zoom for web visitors (an accessibility regression that
// Android Chrome enforces), whereas inside the app shell a fixed scale is
// the expected native behaviour.
export function lockNativeViewportZoom(): void {
  if (!isNative()) return;

  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (!meta) return;

  const base = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  meta.setAttribute('content', `${base}, maximum-scale=1.0, user-scalable=no`);
}

export async function syncStatusBarTheme(theme: 'light' | 'dark'): Promise<void> {
  if (!isNative()) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: theme === 'light' ? Style.Light : Style.Dark });
    await StatusBar.setBackgroundColor({ color: theme === 'light' ? '#ffffff' : '#0f0f17' });
  } catch (err) {
    console.warn('[capacitor] syncStatusBarTheme failed', err);
  }
}
