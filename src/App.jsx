import Topbar from "./components/Topbar";
import ThemeToggle from "./components/ThemeToggle";
import BottomNav from "./components/BottomNav";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/products/Products";
import Customers from "./pages/customers/Customers";
import Orders from "./pages/orders/Orders";
import CreateOrder from "./pages/orders/CreateOrder";
import StockHistory from "./pages/StockHistory";
import { Toaster, ToastBar, resolveValue } from "react-hot-toast";
import { motion } from "framer-motion";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#faf9f7] via-[#f7f5f0] to-[#f4f1ea] text-[#2a2a2a] transition-colors duration-500">
      {/* PC: Topbar */}
      <div className="hidden md:block">
        <Topbar />
      </div>

      {/* Mobile: Bottom Navigation */}
      <div className="block md:hidden">
        <BottomNav />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 pb-20">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<CreateOrder />} />
            <Route path="/stock" element={<StockHistory />} />
          </Routes>
        </div>
      </main>

      {/* 🌈 Global Toaster đẹp, hỗ trợ mobile */}
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontWeight: "500",
          },
        }}
      >
        {(t) => (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-center gap-2 text-[15px] px-2">
                  {icon}
                  <span>{resolveValue(message, t)}</span>
                </div>
              )}
            </ToastBar>
          </motion.div>
        )}
      </Toaster>
    </div>
  );
}
