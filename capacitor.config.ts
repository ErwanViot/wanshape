import type { CapacitorConfig } from '@capacitor/cli';

// Repeated below for ios/android/SplashScreen/StatusBar — Capacitor's typed
// config does not let us reference one property from another, so the dark
// surface color is duplicated by design. Keep these in sync if the design
// system ever moves away from #0f0f17.
const DARK_SURFACE = '#0f0f17';

const config: CapacitorConfig = {
  appId: 'fr.wansoft.wan2fit',
  appName: 'Wan2Fit',
  webDir: 'dist',
  backgroundColor: DARK_SURFACE,
  ios: {
    contentInset: 'always',
    backgroundColor: DARK_SURFACE,
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: DARK_SURFACE,
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: DARK_SURFACE,
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'native',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: DARK_SURFACE,
      overlaysWebView: false,
    },
  },
};

export default config;
