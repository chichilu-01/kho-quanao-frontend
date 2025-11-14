import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ✅ Cấu hình PWA hoàn chỉnh cho RC Studio
export default defineConfig({
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
        theme_color: "#000000",
        background_color: "#000000",
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
        runtimeCaching: [
          {
            // Cache API backend Railway
            urlPattern:
              /^https:\/\/kho-quanao-backend-production\.up\.railway\.app\/api\/.*$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 1 ngày
              },
            },
          },
          {
            // Cache hình ảnh (Cloudinary, sản phẩm, logo,…)
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 tuần
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
      "f5afe18c-a293-4f59-8649-cc82af0d7d46-00-1144g3c0jfi8g.sisko.replit.dev",
    ],
    host: true,
    port: 5173,
  },
});
