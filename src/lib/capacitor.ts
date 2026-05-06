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
