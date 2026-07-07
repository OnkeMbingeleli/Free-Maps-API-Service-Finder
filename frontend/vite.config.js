import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Vite + PWA plugin: this is what turns on the offline service worker
// described in the blueprint (§7 OFFLINE-FIRST ARCHITECTURE).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Cache the app shell + last-fetched service/map data.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/services'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'services-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
      manifest: false, // we ship our own public/manifest.json
    }),
  ],
  server: { port: 5173 },
});
