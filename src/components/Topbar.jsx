import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiFileText,
  FiPlusCircle,
  FiMenu,
  FiX,
} from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

export default function Topbar() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { to: "/", icon: <FiHome />, label: "Tổng quan" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/orders", icon: <FiShoppingCart />, label: "Đơn hàng" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo đơn" },
    { to: "/stock", icon: <FiFileText />, label: "Kho" },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-yellow-200/40 dark:border-yellow-500/20 shadow-[0_2px_15px_rgba(242,201,76,0.1)] z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 py-3">
        {/* 🔥 Logo */}
        <div className="flex items-center gap-2 select-none">
          <img
            src="/icons/icon-192x192.png"
            alt="RC Studio"
            className="h-9 w-9 object-contain drop-shadow-[0_0_8px_#f2c94c]"
          />
          <span className="font-extrabold text-lg bg-gradient-to-r from-[#f2c94c] to-[#d4a017] bg-clip-text text-transparent tracking-wide">
            RC Studio
          </span>
        </div>

        {/* 🌗 Theme + Menu (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-6 text-sm font-medium">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2 transition duration-300 ${
                    isActive
                      ? "text-[#d4a017] font-semibold drop-shadow-[0_0_6px_#f2c94c]"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#d4a017] hover:scale-[1.05]"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>

        {/* 📱 Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-gray-700 dark:text-gray-300"
        >
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* 📱 Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-yellow-200/30 dark:border-yellow-500/20 flex flex-col items-start px-5 pb-4"
          >
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full py-3 text-sm font-medium border-b border-gray-100/10 ${
                    isActive
                      ? "text-[#d4a017] font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#d4a017]"
                  }`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
            <div className="mt-3">
              <ThemeToggle />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
