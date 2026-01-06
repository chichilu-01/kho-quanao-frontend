import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Customers from "./pages/customers/Customers";
import Orders from "./pages/orders/Orders";
import CreateOrder from "./pages/orders/CreateOrder";
import StockHistory from "./pages/StockHistory";
import OrderDetail from "./pages/orders/OrderDetail";

export default function App() {
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] overflow-hidden">
      {/* PC: Topbar */}
      <div className="hidden md:block shrink-0">
        <Topbar />
      </div>

      {/* MAIN CONTENT */}
      {/* 🔥 SỬA: Đổi pb-[85px] thành pb-0 để bỏ khoảng trắng thừa */}
      <main className="flex-1 pt-0 md:pt-8 px-0 md:px-8 pb-0 md:pb-8 w-full relative overflow-hidden">
        <div className="h-full w-full animate-fadeIn">
          <Routes>
            {/* 🔥 CÁC TRANG CẦN CUỘN (Dashboard, Orders...):
               - Thêm class "pb-24" (Padding đáy) vào wrapper div.
               - Điều này giúp nội dung cuộn được xuống hết mà không bị BottomNav che mất.
               - Nhưng background vẫn tràn full màn hình.
            */}
            <Route
              path="/"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <Dashboard />
                </div>
              }
            />

            {/* Products tự quản lý cuộn bên trong nó, không cần pb-24 ở đây */}
            <Route path="/products" element={<Products />} />

            <Route
              path="/customers"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <Customers />
                </div>
              }
            />
            <Route
              path="/orders"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <Orders />
                </div>
              }
            />
            <Route
              path="/orders/new"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <CreateOrder />
                </div>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <OrderDetail />
                </div>
              }
            />
            <Route
              path="/stock"
              element={
                <div className="h-full overflow-y-auto pb-24">
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
