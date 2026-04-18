import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // No `includeAssets`: sessions/*.json are cached on-demand via the
      // runtimeCaching CacheFirst rule below, and photo-wan.png is too large
      // (~1.7 MB) to precache eagerly on first load. The service worker
      // should ship a minimal install bundle and grab the rest lazily.
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
        globPatterns: ['**/*.{js,css,html,json,svg,png}'],
        // og-image.jpg: social preview, never needed by the app itself.
        // photo-wan.png: large portrait (~1.7 MB) rendered tiny; runtime-fetched.
        // sessions/*.json: 200+ entries covered by the sessions-cache rule below.
        globIgnores: ['**/og-image.jpg', '**/photo-wan.png', 'sessions/**/*.json'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/sessions\//, /^\/images\//, /^\/videos\//, /^\/icons\//, /^\/api\//, /^\/ads\.txt$/],
        runtimeCaching: [
          {
            urlPattern: /\/sessions\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sessions-cache',
              expiration: { maxEntries: 110, maxAgeSeconds: 60 * 60 * 24 * 120 },
            },
          },
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
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
    mode === 'production' && sentryVitePlugin({
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
          'router': ['react-router'],
          'supabase': ['@supabase/supabase-js'],
          'sentry': ['@sentry/react'],
        },
      },
    },
  },
}))
