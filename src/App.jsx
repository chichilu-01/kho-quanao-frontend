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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] transition-colors duration-500">
      {/* PC: Topbar */}
      <div className="hidden md:block">
        <Topbar />
      </div>

      {/* MAIN CONTENT */}
      {/* 🔥 SỬA QUAN TRỌNG TẠI ĐÂY: */}
      {/* Cũ: px-3 (có lề) */}
      {/* Mới: px-0 (không lề trên mobile), md:px-8 (giữ lề trên PC cho đẹp) */}
      <main className="flex-1 pt-0 md:pt-8 px-0 md:px-8 pb-[85px] md:pb-8 overflow-y-auto">
        {/* Container con cũng đảm bảo không bị margin thừa */}
        <div className="max-w-7xl mx-auto animate-fadeIn">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<CreateOrder />} />
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
