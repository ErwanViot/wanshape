import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// CAPACITOR_BUILD=true skips PWA service worker — native WebView handles
// its own cache, and a SW fights deep links + Capgo OTA bundle replacement.
const isNativeBuild = process.env.CAPACITOR_BUILD === 'true';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    !isNativeBuild &&
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Wan2Fit',
          short_name: 'Wan2Fit',
          description: 'Ta séance de sport quotidienne, prête à lancer',
          theme_color: '#0f0f17',
          background_color: '#0f0f17',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,json,svg,png,woff2}'],
          // og-image.jpg: social preview, never needed by the app itself.
          globIgnores: ['**/og-image.jpg'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/images\//, /^\/videos\//, /^\/icons\//, /^\/api\//, /^\/ads\.txt$/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/api\/.*/,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/images\/.*\.webp$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              urlPattern: /\/videos\/.*\.mp4$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'videos-cache',
                // Tightened from (30 entries / 90 days) to (15 / 7) — exercise
                // videos are 1-5 MB each, and iOS Safari aggressively purges
                // sites that exceed a few hundred MB of cached storage. The
                // 7-day window is a deliberate trade-off: missing the cache on
                // a less-frequent exercise costs one re-download, but bloating
                // the cache costs everyone.
                expiration: { maxEntries: 15, maxAgeSeconds: 60 * 60 * 24 * 7 },
                cacheableResponse: { statuses: [200] },
              },
            },
          ],
        },
      }),
    mode === 'production' &&
      sentryVitePlugin({
        org: 'wan-soft',
        project: 'wan2fit',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      }),
  ].filter(Boolean),
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          router: ['react-router'],
          supabase: ['@supabase/supabase-js'],
          sentry: ['@sentry/react'],
        },
      },
    },
  },
}));
