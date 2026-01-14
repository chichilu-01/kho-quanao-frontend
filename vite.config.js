import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression"; // 🔥 Nâng cấp 1: Nén file
import path from "path"; // 🔥 Nâng cấp 2: Dùng để cấu hình alias

export default defineConfig({
  base: "/",

  // 🔥 Nâng cấp 2: Cấu hình Alias (viết code gọn hơn)
  // Ví dụ: import Header from '@/components/Header' thay vì '../../components/Header'
  /*resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },*/

  plugins: [
    react(),

    // 🔥 Nâng cấp 1: Nén Gzip giúp app load siêu nhanh
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),

    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true, // Cho phép test PWA ngay ở localhost (khi dev)
      },
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "icons/*.png", // Gom gọn
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
            purpose: "any maskable", // Giúp icon đẹp hơn trên Android mới
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
        cleanupOutdatedCaches: true, // 🔥 Fix: Tự động xóa cache cũ khi up version mới
        clientsClaim: true,
        skipWaiting: true,

        // Cache luôn các file JS, CSS, HTML cốt lõi
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],

        navigateFallbackDenylist: [
          /^\/api/,
          /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        ],

        runtimeCaching: [
          {
            // Cache API từ Backend Railway
            urlPattern:
              /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 200, // Tăng lên 200 cho thoải mái
                maxAgeSeconds: 60 * 60 * 24 * 7, // Tăng lên 7 ngày (cho chắc cốp)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10, // Nếu mạng lag quá 10s thì lấy cache ra dùng luôn
            },
          },
          {
            // Cache hình ảnh (CDN hoặc từ server)
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 ngày
              },
            },
          },
          {
            // 🔥 Thêm: Cache Font chữ (nếu dùng Google Fonts)
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-cache",
            },
          },
        ],
      },
    }),
  ],

  // 🔥 Nâng cấp 3: Tối ưu Build (Chia nhỏ file)
  build: {
    outDir: "dist",
    sourcemap: false, // Tắt sourcemap để giảm dung lượng file build và bảo mật code
    chunkSizeWarningLimit: 1600, // Tăng giới hạn cảnh báo size
    rollupOptions: {
      output: {
        // Tách các thư viện lớn ra khỏi file main.js
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react"; // Gom React riêng
            }
            if (id.includes("antd") || id.includes("@ant-design")) {
              return "vendor-ui"; // Gom UI Library riêng (nếu bạn dùng Antd/MUI)
            }
            return "vendor"; // Các thư viện khác
          }
        },
      },
    },
  },

  server: {
    allowedHosts: ["all"],
    host: true,
    port: 5173,
    // proxy: { ... } // Nếu cần proxy API local thì thêm vào đây
  },
});
