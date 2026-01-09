import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // 🔥 FIX 1: Đổi thành "/" (tuyệt đối) thay vì "./" (tương đối)
  // Giúp app chạy đúng khi vào các route sâu như /products/123
  base: "/",

  plugins: [
    react(),
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
        theme_color: "#ffffff", // Nên để màu trắng hoặc màu chủ đạo sáng
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // 🔥 FIX 2: Quan trọng cho SPA (Single Page App)
        // Nếu không tìm thấy file, luôn trả về index.html để React Router xử lý
        navigateFallback: "/index.html",

        // Không áp dụng fallback cho các đường dẫn bắt đầu bằng /api hoặc hình ảnh
        navigateFallbackDenylist: [
          /^\/api/,
          /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
        ],

        runtimeCaching: [
          {
            // Cache API từ Backend Railway
            urlPattern:
              /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
            handler: "NetworkFirst", // Ưu tiên mạng, mất mạng mới dùng cache
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100, // Tăng lên chút để lưu được nhiều đơn hàng/sản phẩm hơn
                maxAgeSeconds: 60 * 60 * 24 * 3, // Lưu 3 ngày (đề phòng mất mạng lâu)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Cache hình ảnh
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst", // Ưu tiên cache cho ảnh load nhanh
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // Lưu 30 ngày
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    allowedHosts: [
      "localhost",
      "all", // Cho phép tất cả host (tiện khi dev trên Replit/Ngrok)
    ],
    host: true,
    port: 5173,
  },
});
