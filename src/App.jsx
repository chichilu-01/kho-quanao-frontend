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
      {/* Giữ nguyên pb-0 ở đây */}
      <main className="flex-1 pt-0 md:pt-8 px-0 md:px-8 pb-0 md:pb-8 w-full relative overflow-hidden">
        <div className="h-full w-full animate-fadeIn">
          <Routes>
            <Route
              path="/"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <Dashboard />
                </div>
              }
            />

            {/* Products tự quản lý cuộn */}
            <Route path="/products" element={<Products />} />

            {/* Customers giữ nguyên nếu chưa sửa code bên trong */}
            <Route
              path="/customers"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <Customers />
                </div>
              }
            />

            {/* 🔥 ĐÃ SỬA: Xóa thẻ div bọc ngoài (h-full overflow... pb-24) đi. 
                Để <Orders /> render trực tiếp vì bên trong nó đã xử lý full màn hình rồi. 
            */}
            <Route path="/orders" element={<Orders />} />

            <Route
              path="/orders/new"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <CreateOrder />
                </div>
              }
            />

            {/* Nếu OrderDetail cũng đã được tối ưu giống Orders thì bỏ bọc luôn, 
                còn nếu chưa thì tạm giữ nguyên */}
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
