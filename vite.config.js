import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    viteCompression({ algorithm: "gzip", ext: ".gz" }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"], // Cách viết này OK
      manifest: {
        name: "Kho Quần Áo RC Studio",
        short_name: "RC Studio",
        description: "App quản lý kho RC Studio",

        // 🔥 QUAN TRỌNG 1: Thêm background_color
        // Màu này PHẢI trùng với màu nền của file icon png của bạn
        // Nếu icon nền trắng -> để #ffffff. Nếu icon nền đen -> để #000000
        theme_color: "#ffffff",
        background_color: "#ffffff",

        display: "standalone",
        orientation: "portrait", // Khóa màn hình dọc (tùy chọn)

        // 🔥 QUAN TRỌNG 2: Cấu hình icons chuẩn nhất
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any", // Dùng cho những chỗ không cần cắt tròn (ví dụ trên PC, iOS)
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable", // Dùng riêng cho Android để cắt tròn
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // ... phần workbox giữ nguyên
      workbox: {
        // ... code cũ của bạn
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 * 30 },
            },
          },
          {
            urlPattern:
              /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", networkTimeoutSeconds: 10 },
          },
        ],
      },
    }),
  ],
  // ... phần build và server giữ nguyên
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("html2canvas") ||
            id.includes("jspdf") ||
            id.includes("xlsx") ||
            id.includes("canvg")
          ) {
            return "heavy-tools";
          }
          if (id.includes("node_modules")) {
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
