import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/",

  plugins: [
    react(),

    // Vẫn giữ nén Gzip để tải nhanh
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icons/icon-192x192.png",
        "icons/icon-512x512.png",
      ],
      manifest: {
        name: "Kho Quần Áo RC Studio",
        short_name: "RC Studio",
        description:
          "Ứng dụng quản lý kho và bán hàng thời trang của RC Studio",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [
          /^\/api/,
          /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        ],
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 3,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],

  // 🔥 SỬA LẠI PHẦN NÀY: CHIA FILE AN TOÀN HƠN
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // Tăng giới hạn cảnh báo lên
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Chỉ tách riêng React Core (An toàn tuyệt đối)
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }
            // Các thư viện khác gom hết vào 1 cục 'vendor' để tránh lỗi
            return "vendor";
          }
        },
      },
    },
  },

  server: {
    allowedHosts: ["localhost", "all"],
    host: true,
    port: 5173,
  },
});
