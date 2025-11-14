import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./styles/rc-theme-pro.css";
import { Toaster } from "react-hot-toast"; // ✅ Dùng cho hệ thống notify

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* ✅ Toast hiển thị toàn cục */}
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
  </React.StrictMode>,
);
