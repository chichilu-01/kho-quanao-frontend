import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  base: "/",

  plugins: [
    react(),

    // Nén Gzip giúp tải nhanh
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
        cleanupOutdatedCaches: true, // Tự dọn cache cũ
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

  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. Tách React Core (Ưu tiên load trước)
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }

            // 2. Tách UI Library (Antd, MUI, Framer...)
            if (
              id.includes("antd") ||
              id.includes("@mui") ||
              id.includes("framer-motion") ||
              id.includes("@headlessui")
            ) {
              return "vendor-ui";
            }

            // 3. Tách thư viện dữ liệu (Excel, Chart)
            if (
              id.includes("xlsx") ||
              id.includes("recharts") ||
              id.includes("chart.js") ||
              id.includes("moment") ||
              id.includes("date-fns")
            ) {
              return "vendor-data";
            }

            // 4. 🔥 TÁCH RIÊNG CỤC NẶNG 1MB (HTML2Canvas, PDF)
            if (
              id.includes("html2canvas") ||
              id.includes("jspdf") ||
              id.includes("canvg") ||
              id.includes("dompurify")
            ) {
              return "vendor-pdf-print";
            }

            // 5. Tách các tiện ích nhỏ
            if (
              id.includes("lodash") ||
              id.includes("axios") ||
              id.includes("uuid")
            ) {
              return "vendor-utils";
            }

            // Còn lại
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
