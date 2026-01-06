import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 1. Import React Query
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "react-hot-toast";

// 2. Cấu hình Client cho React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Không tự load lại khi click ra ngoài tab
      staleTime: 1000 * 60 * 5, // Dữ liệu được coi là "mới" trong 5 phút (Cache)
      retry: 1, // Thử lại 1 lần nếu lỗi mạng
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* 3. Bọc toàn bộ App bằng QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        {/* Toast hiển thị toàn cục */}
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
