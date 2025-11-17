import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingBag,
  FiArchive,
  FiPlusCircle,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function BottomNav() {
  // 🌙 DARK MODE STATES
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // MENU CHÍNH
  const navItems = [
    { to: "/", icon: <FiHome />, label: "Tổng quan" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/orders", icon: <FiShoppingBag />, label: "Đơn hàng" },
    { to: "/stock", icon: <FiArchive />, label: "Kho" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo đơn" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center
      bg-black/90 backdrop-blur-md border-t border-yellow-700/30 py-2
      shadow-[0_-2px_10px_rgba(255,215,0,0.2)]
    "
    >
      {/* ================= NAV ITEMS ================= */}
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative flex flex-col items-center text-xs transition-all duration-300 ${
              isActive
                ? "text-yellow-400"
                : "text-gray-400 hover:text-yellow-200"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="text-lg relative">
                {item.icon}

                {/* Glow vàng */}
                {isActive && (
                  <motion.span
                    layoutId="navGlow"
                    className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 1.2,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </div>

              <span className="mt-0.5 font-medium tracking-tight">
                {item.label}
              </span>

              {/* Line sáng chạy */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 h-[2px] w-5/6 
                  bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      {/* ================= DARK MODE TOGGLE ================= */}
      <motion.button
        onClick={toggleTheme}
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        className="
          ml-2 w-11 h-11 flex items-center justify-center
          rounded-full bg-gray-700/50 border border-yellow-600/40
          shadow-[0_0_10px_rgba(255,215,0,0.3)]
          backdrop-blur-md
        "
      >
        <AnimatePresence mode="wait">
          {dark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
            >
              <FiMoon size={20} className="text-yellow-400" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.25 }}
            >
              <FiSun size={20} className="text-yellow-300" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </nav>
  );
}
