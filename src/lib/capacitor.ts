import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios';

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android';

export async function hideNativeSplash(): Promise<void> {
  if (!isNative()) return;

  const { SplashScreen } = await import('@capacitor/splash-screen');
  await SplashScreen.hide({ fadeOutDuration: 200 });
}

export async function syncStatusBarTheme(theme: 'light' | 'dark'): Promise<void> {
  if (!isNative()) return;

  const { StatusBar, Style } = await import('@capacitor/status-bar');
  await StatusBar.setStyle({ style: theme === 'light' ? Style.Light : Style.Dark });
  await StatusBar.setBackgroundColor({ color: theme === 'light' ? '#ffffff' : '#0f0f17' });
}
