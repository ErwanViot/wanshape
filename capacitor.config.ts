import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.wansoft.wan2fit',
  appName: 'Wan2Fit',
  webDir: 'dist',
  backgroundColor: '#0f0f17',
  ios: {
    contentInset: 'always',
    backgroundColor: '#0f0f17',
    limitsNavigationsToAppBoundDomains: true,
  },
  android: {
    backgroundColor: '#0f0f17',
    allowMixedContent: false,
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: '#0f0f17',
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
      backgroundColor: '#0f0f17',
      overlaysWebView: false,
    },
  },
};

export default config;
