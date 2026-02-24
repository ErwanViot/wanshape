import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['sessions/*.json'],
      manifest: {
        name: 'WAN SHAPE',
        short_name: 'WAN SHAPE',
        description: 'Ta séance de sport quotidienne, prête à lancer',
        theme_color: '#ffffff',
        background_color: '#f8f8f8',
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
        globPatterns: ['**/*.{js,css,html,json,png,svg}'],
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
  ],
})
