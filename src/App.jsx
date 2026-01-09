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
import { NavProvider } from "./context/NavContext";
import { useOnlineStatus } from "./hooks/useOnlineStatus"; // 🔥 1. Import Hook
import { FiWifiOff } from "react-icons/fi"; // Import icon wifi off

function MainLayout() {
  const isOnline = useOnlineStatus(); // 🔥 2. Lấy trạng thái mạng

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] overflow-hidden">
      {/* 🔥 3. THANH BÁO OFFLINE (Chỉ hiện khi mất mạng) */}
      {!isOnline && (
        <div className="bg-red-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md z-[9999] animate-fadeIn">
          <FiWifiOff />
          Mất kết nối Internet - Đang xem dữ liệu Offline
        </div>
      )}

      {/* PC: Topbar */}
      <div className="hidden md:block shrink-0">
        <Topbar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 pt-0 md:pt-8 px-0 md:px-8 pb-0 md:pb-8 w-full relative overflow-hidden">
        <div className="h-full w-full animate-fadeIn">
          <Routes>
            {/* Dashboard tự quản lý cuộn */}
            <Route path="/" element={<Dashboard />} />

            {/* Products tự quản lý cuộn */}
            <Route path="/products" element={<Products />} />

            {/* Customers tự quản lý cuộn */}
            <Route path="/customers" element={<Customers />} />

            {/* Orders tự quản lý cuộn */}
            <Route path="/orders" element={<Orders />} />

            {/* Các trang chưa sửa Full màn hình -> Vẫn giữ div bọc */}
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

            {/* StockHistory tự quản lý cuộn */}
            <Route path="/stock" element={<StockHistory />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE NAV */}
      <div className="block md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <NavProvider>
      <MainLayout />
    </NavProvider>
  );
}
