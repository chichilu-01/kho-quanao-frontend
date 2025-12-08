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

  const navItems = [
    { to: "/", icon: <FiHome />, label: "Trang chủ" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "KH" },
    { to: "/orders", icon: <FiShoppingBag />, label: "Đơn" },
    { to: "/stock", icon: <FiArchive />, label: "Kho" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo" },
  ];

  return (
    <motion.nav
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50 
        w-[92%] max-w-[450px]
        bg-black/60 backdrop-blur-xl 
        border border-yellow-300/20 
        rounded-3xl px-3 py-2
        shadow-[0_0_25px_rgba(255,220,100,0.25)]
      "
    >
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="relative flex flex-col items-center"
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{
                    y: isActive ? -6 : 0,
                    scale: isActive ? 1.25 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 250, damping: 12 }}
                  className="
                    w-10 h-10 flex items-center justify-center 
                    rounded-2xl 
                    transition-all duration-300
                    relative
                  "
                >
                  {/* Icon */}
                  <span
                    className={`text-xl ${
                      isActive ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Glow active */}
                  {isActive && (
                    <motion.span
                      layoutId="navGlowPro"
                      className="absolute inset-0 rounded-2xl bg-yellow-400/20 blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </motion.div>

                {/* Label mượt kiểu iOS */}
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 6 }}
                  className="text-[10px] text-yellow-300 font-medium mt-1"
                >
                  {item.label}
                </motion.span>
              </>
            )}
          </NavLink>
        ))}

        {/* Nút toggle dark mode */}
        <motion.button
          onClick={toggleTheme}
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.15 }}
          className="
            ml-1 w-11 h-11 flex items-center justify-center
            rounded-2xl bg-gray-700/40
            border border-yellow-500/30
            shadow-[0_0_15px_rgba(255,220,140,0.25)]
            backdrop-blur-lg
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
                <FiMoon size={20} className="text-yellow-300" />
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
      </div>
    </motion.nav>
  );
}
