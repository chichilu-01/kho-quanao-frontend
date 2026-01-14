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
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Kho Quần Áo RC Studio",
        short_name: "RC Studio",
        description: "App quản lý kho RC Studio",
        theme_color: "#ffffff",
        display: "standalone",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
            {
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: { cacheName: 'images', expiration: { maxEntries: 50, maxAgeSeconds: 86400 * 30 } }
            },
            {
                urlPattern: /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
                handler: 'NetworkFirst',
                options: { cacheName: 'api-cache', networkTimeoutSeconds: 10 }
            }
        ]
      },
    }),
  ],

  // 🔥 CẤU HÌNH FIX LỖI MÀN HÌNH TRẮNG
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 3000, // Tăng giới hạn lên để không báo vàng
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Chỉ tách riêng các công cụ NẶNG và ĐỘC LẬP (An toàn để tách)
          if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('xlsx') || id.includes('canvg')) {
            return 'heavy-tools'; 
          }

          // 2. Còn lại gom TẤT CẢ (React, Antd, Router...) vào chung 1 file
          // Đảm bảo app chạy 100% không lỗi thiếu thư viện
          if (id.includes('node_modules')) {
            return 'vendor';
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