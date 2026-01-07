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
// 1. Import Context để nhận lệnh ẩn/hiện
import { useNav } from "../context/NavContext";

export default function BottomNav() {
  const [dark, setDark] = useState(false);

  // 2. Lấy trạng thái hiển thị từ Context
  // (Lưu ý: Nếu chưa bọc App trong NavProvider thì dòng này sẽ lỗi, hãy đảm bảo đã làm bước App.js trước đó)
  const { isNavVisible } = useNav();

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
      className={`
        fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center
        bg-white/90 backdrop-blur-md border-t border-gray-300 
        py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]
        dark:bg-black/90 dark:border-yellow-700/30

        /* 3. THÊM CLASS XỬ LÝ HIỆU ỨNG TRƯỢT */
        transition-transform duration-300 ease-in-out
        ${isNavVisible ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {/* ================= NAV ITEMS ================= */}
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `relative flex flex-col items-center text-xs font-medium transition-all duration-300 ${
              isActive
                ? "text-yellow-600"
                : "text-gray-600 hover:text-yellow-500"
            } dark:${isActive ? "text-yellow-400" : "text-gray-400 hover:text-yellow-200"}`
          }
        >
          {({ isActive }) => (
            <>
              <div className="text-lg relative">
                {item.icon}

                {/* Glow vàng PRO */}
                {isActive && (
                  <motion.span
                    layoutId="navGlow"
                    className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.25, 1] }}
                    transition={{
                      duration: 1.3,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                )}
              </div>

              <span className="mt-0.5 tracking-tight">{item.label}</span>

              {/* Line sáng chạy */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 h-[2px] w-4/5 
                  bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full
                  dark:via-yellow-400
                  "
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
          rounded-full bg-gray-200/70 border border-gray-300
          shadow-[0_0_10px_rgba(0,0,0,0.08)]
          backdrop-blur-md
          dark:bg-gray-700/50 dark:border-yellow-600/40
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
              <FiMoon
                size={20}
                className="text-yellow-500 dark:text-yellow-300"
              />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.25 }}
            >
              <FiSun size={20} className="text-yellow-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </nav>
  );
}
