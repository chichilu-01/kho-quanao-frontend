import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiArchive,
  FiPlusCircle,
} from "react-icons/fi";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // 🧩 Click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { to: "/", icon: <FiHome />, label: "Tổng quan" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/orders", icon: <FiShoppingCart />, label: "Đơn hàng" },
    { to: "/stock", icon: <FiArchive />, label: "Lịch sử kho" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo đơn" },
  ];

  return (
    <>
      {/* 🟡 Logo nổi – premium pulse */}
      <motion.div
        drag
        dragElastic={0.12}
        dragMomentum={false}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 left-3 z-[9999] cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={() => setOpen(!open)}
          className="
            relative flex items-center justify-center w-12 h-12 rounded-full
            bg-gradient-to-r from-[#f2c94c] to-[#d4a017]
            shadow-lg hover:scale-105 transition-all
          "
        >
          {/* Glow pulse */}
          <span className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl animate-ping" />

          <img
            src="/icons/icon-192x192.png"
            alt="RC Studio"
            className="w-9 h-9 rounded-full object-cover relative z-10"
          />
        </button>
      </motion.div>

      {/* 🔹 Overlay mờ */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 🧭 Sidebar Menu PRO */}
      <motion.div
        ref={menuRef}
        initial={false}
        animate={{
          x: open ? 0 : "-105%",
          rotateY: open ? 0 : -15,
          opacity: open ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="
          fixed top-0 left-0 h-full w-64
          bg-gradient-to-b from-[#0b0b0b] via-[#121212] to-[#1c1c1c]
          text-white z-[9999]
          flex flex-col border-r border-[#222]
          shadow-[8px_0_25px_rgba(0,0,0,0.45)]
        "
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#222]">
          <img
            src="/icons/icon-192x192.png"
            alt="RC Studio"
            className="h-10 w-10 object-contain drop-shadow-[0_0_6px_#f2c94c]"
          />
          <span className="bg-gradient-to-r from-[#f8d47e] to-[#b98934] bg-clip-text text-transparent font-semibold text-lg tracking-wide">
            RC Studio
          </span>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto mt-2 pr-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                group relative flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-lg
                transition-all duration-300 overflow-hidden
                ${
                  isActive
                    ? "bg-yellow-500/20 text-yellow-400 border-l-4 border-yellow-400 shadow-[0_0_12px_rgba(242,201,76,0.25)]"
                    : "text-gray-300 hover:text-yellow-300 hover:bg-white/5"
                }
              `
              }
            >
              {/* Ripple hiệu ứng */}
              <span className="absolute inset-0 bg-yellow-400/10 opacity-0 group-hover:opacity-100 transition-all duration-300" />

              <motion.span
                animate={{ scale: 1 }}
                className="text-lg drop-shadow-[0_0_4px_rgba(242,201,76,0.2)]"
              >
                {item.icon}
              </motion.span>

              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 text-center text-[11px] text-gray-500 border-t border-[#222]">
          © 2025 RC Studio — Premium UI
        </div>
      </motion.div>
    </>
  );
}
