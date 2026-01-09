import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

// 2. Cấu hình Client cho React Query (Đã tối ưu cho PWA/Offline)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🔥 QUAN TRỌNG CHO OFFLINE:
      networkMode: "offlineFirst", // Nếu mất mạng, vẫn trả về dữ liệu trong Cache (không báo lỗi)

      refetchOnWindowFocus: false, // Không tự load lại khi click ra ngoài tab
      retry: false, // Không thử lại liên tục khi mất mạng để đỡ lag

      // Thời gian dữ liệu được coi là "tươi mới" (không cần fetch lại)
      staleTime: 1000 * 60 * 60, // 1 giờ (Tăng lên để đỡ tốn request)

      // Thời gian giữ Cache trong bộ nhớ (khi user tắt tab hoặc mất mạng)
      // (Lưu ý: v5 dùng gcTime, v4 dùng cacheTime)
      gcTime: 1000 * 60 * 60 * 24, // 24 giờ
    },
    mutations: {
      networkMode: "offlineFirst", // Cho phép bấm nút "Lưu" khi mất mạng (nhưng cần xử lý logic queue sau này)
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: {
              background: "#fff",
              color: "#333",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
