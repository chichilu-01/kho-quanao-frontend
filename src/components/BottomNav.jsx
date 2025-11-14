import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingBag,
  FiArchive,
  FiPlusCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function BottomNav() {
  const navItems = [
    { to: "/", icon: <FiHome />, label: "Tổng quan" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
    { to: "/orders", icon: <FiShoppingBag />, label: "Đơn hàng" },
    { to: "/stock", icon: <FiArchive />, label: "Kho" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo đơn" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-black/90 backdrop-blur-md border-t border-yellow-700/30 py-2 shadow-[0_-2px_10px_rgba(255,215,0,0.2)]">
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

              {/* 💫 Ánh sáng chạy ngang khi active */}
              {isActive && (
                <motion.div
                  className="absolute -bottom-0.5 h-[2px] w-5/6 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"
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
    </nav>
  );
}
