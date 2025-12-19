import Topbar from "./components/Topbar";
import BottomNav from "./components/BottomNav";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Customers from "./pages/customers/Customers";
import Orders from "./pages/orders/Orders";
import CreateOrder from "./pages/orders/CreateOrder";
import StockHistory from "./pages/StockHistory";

// 👇 1. Import thêm file Chi tiết đơn hàng
import OrderDetail from "./pages/orders/OrderDetail";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] transition-colors duration-500">
      {/* PC: Topbar */}
      <div className="hidden md:block">
        <Topbar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-0 md:pt-8 px-3 md:px-8 pb-[85px] md:pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />

            {/* Các Route liên quan đến Đơn hàng */}
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<CreateOrder />} />

            {/* 👇 2. Thêm dòng này để xem chi tiết đơn theo ID */}
            {/* Khi user bấm vào đơn hàng #7, nó sẽ mở trang OrderDetail */}
            <Route path="/orders/:id" element={<OrderDetail />} />

            <Route path="/stock" element={<StockHistory />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE NAV */}
      <div className="block md:hidden fixed bottom-0 inset-x-0 z-50">
        <BottomNav />
      </div>
    </div>
  );
}
