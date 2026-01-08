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

function MainLayout() {
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] overflow-hidden">
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

            {/* 🔥 SỬA: Customers tự quản lý cuộn -> BỎ DIV BỌC */}
            <Route path="/customers" element={<Customers />} />

            {/* Orders tự quản lý cuộn */}
            <Route path="/orders" element={<Orders />} />

            {/* CreateOrder chưa sửa full màn hình nên VẪN CẦN DIV BỌC */}
            <Route
              path="/orders/new"
              element={
                <div className="h-full overflow-y-auto pb-24">
                  <CreateOrder />
                </div>
              }
            />

            {/* OrderDetail chưa sửa full màn hình nên VẪN CẦN DIV BỌC */}
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
