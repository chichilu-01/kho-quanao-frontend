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
import ThemeToggle from "./ThemeToggle";

export default function BottomNav() {
  const navItemsLeft = [
    { to: "/", icon: <FiHome />, label: "Tổng quan" },
    { to: "/products", icon: <FiBox />, label: "Sản phẩm" },
    { to: "/customers", icon: <FiUsers />, label: "Khách hàng" },
  ];

  const navItemsRight = [
    { to: "/orders", icon: <FiShoppingBag />, label: "Đơn hàng" },
    { to: "/stock", icon: <FiArchive />, label: "Kho" },
    { to: "/orders/new", icon: <FiPlusCircle />, label: "Tạo đơn" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-black/90 backdrop-blur-md border-t border-yellow-700/30 py-2 px-4 shadow-[0_-2px_10px_rgba(255,215,0,0.2)]">
      {/* LEFT */}
      <div className="flex gap-6">
        {navItemsLeft.map((item) => (
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
                <span className="mt-0.5 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* CENTER — Theme Button */}
      <div className="mx-3">
        <ThemeToggle small />
      </div>

      {/* RIGHT */}
      <div className="flex gap-6">
        {navItemsRight.map((item) => (
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
                <span className="mt-0.5 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
