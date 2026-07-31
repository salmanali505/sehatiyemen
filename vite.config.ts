// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      mcpPlugin(),
      ...VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        outDir: "dist/client",
        devOptions: { enabled: false },
        includeAssets: ["favicon.ico", "pwa-192.png", "pwa-512.png"],
        manifest: {
          id: "/",
          name: "صحتي | Sehati",
          short_name: "صحتي",
          description: "حجز المواعيد الطبية في اليمن — عيادات، مستشفيات، مختبرات وصيدليات.",
          lang: "ar",
          dir: "rtl",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#0066FF",
          icons: [
            { src: "/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/\.mcp/],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              // HTML navigations must never be cache-first.
              urlPattern: ({ request }: any) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "sehati-pages",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            {
              urlPattern: ({ url }: any) => url.origin === self.location.origin && /\.(?:js|css|woff2?)$/.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "sehati-assets",
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
              handler: "StaleWhileRevalidate",
              options: { cacheName: "sehati-fonts", expiration: { maxEntries: 30 } },
            },
            {
              // Read-only backend data: serve last good copy while offline.
              urlPattern: ({ url, request }: any) =>
                request.method === "GET" && /\/rest\/v1\//.test(url.pathname),
              handler: "NetworkFirst",
              options: {
                cacheName: "sehati-api",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 3 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: ({ request }: any) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "sehati-images",
                expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 14 },
              },
            },
          ],
        },
      }).map((plugin) => ({
        ...plugin,
        // Only run the PWA generation in the client build so sw.js lands in dist/client.
        applyToEnvironment: (env: { name: string }) => env.name === "client",
      })),
    ],
  },
});
