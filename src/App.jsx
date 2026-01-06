import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products"; // Lưu ý: Bạn đang import từ pages, hãy check kỹ đường dẫn import
import Customers from "./pages/customers/Customers";
import Orders from "./pages/orders/Orders";
import CreateOrder from "./pages/orders/CreateOrder";
import StockHistory from "./pages/StockHistory";
import OrderDetail from "./pages/orders/OrderDetail";

export default function App() {
  return (
    // 🔥 1. Đổi min-h-screen -> h-screen và thêm overflow-hidden để khóa body
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] overflow-hidden">
      {/* PC: Topbar */}
      <div className="hidden md:block shrink-0">
        <Topbar />
      </div>

      {/* MAIN CONTENT */}
      {/* 🔥 2. Bỏ overflow-y-auto ở đây. Để từng trang con tự quyết định việc cuộn */}
      {/* Thêm relative để con bên trong fill full chiều cao */}
      <main className="flex-1 pt-0 md:pt-8 px-0 md:px-8 pb-[85px] md:pb-8 w-full relative overflow-hidden">
        <div className="h-full w-full animate-fadeIn">
          <Routes>
            {/* Dashboard cần tự cuộn, nên bọc thêm div cuộn cho nó nếu cần */}
            <Route
              path="/"
              element={
                <div className="h-full overflow-y-auto">
                  <Dashboard />
                </div>
              }
            />

            {/* Products đã có logic cuộn riêng, không cần bọc */}
            <Route path="/products" element={<Products />} />

            <Route
              path="/customers"
              element={
                <div className="h-full overflow-y-auto">
                  <Customers />
                </div>
              }
            />
            <Route
              path="/orders"
              element={
                <div className="h-full overflow-y-auto">
                  <Orders />
                </div>
              }
            />
            <Route
              path="/orders/new"
              element={
                <div className="h-full overflow-y-auto">
                  <CreateOrder />
                </div>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <div className="h-full overflow-y-auto">
                  <OrderDetail />
                </div>
              }
            />
            <Route
              path="/stock"
              element={
                <div className="h-full overflow-y-auto">
                  <StockHistory />
                </div>
              }
            />
          </Routes>
        </div>
      </main>

      {/* MOBILE NAV */}
      <div className="block md:hidden fixed bottom-0 inset-x-0 z-50 shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
