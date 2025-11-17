import { motion } from "framer-motion";

export default function MobileTabs({ options, viewMode, setViewMode }) {
  return (
    <div
      className="
      md:hidden
      fixed top-0 left-0 right-0 z-50
      backdrop-blur-md bg-white/80 dark:bg-gray-900/70
      border-b border-gray-200 dark:border-gray-700
      shadow-lg shadow-black/5
      px-3 py-2
    "
      style={{ height: "64px" }}
    >
      <div className="flex gap-2 h-full">
        {options.map((opt) => {
          const active = viewMode === opt.value;

          return (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!opt.disabled) {
                  opt.onClick?.();
                  setViewMode(opt.value);
                }
              }}
              disabled={opt.disabled}
              className={`
                flex-1 flex items-center justify-center gap-2
                px-3 py-2 rounded-2xl text-sm font-medium
                transition-all duration-200 select-none relative
                ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30"
                    : "bg-gray-100/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300"
                }
                ${opt.disabled ? "opacity-40" : ""}
              `}
            >
              {/* Icon */}
              {opt.icon && (
                <motion.div
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ duration: 0.25 }}
                >
                  <opt.icon
                    size={18}
                    className={active ? "text-white" : "text-gray-500"}
                  />
                </motion.div>
              )}

              {/* Label */}
              <motion.span
                animate={{ opacity: active ? 1 : 0.8 }}
                className="text-[13px]"
              >
                {opt.label}
              </motion.span>

              {/* Glow Ring (hiệu ứng premium) */}
              {active && (
                <motion.div
                  layoutId="tabs-glow"
                  className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/50"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                ></motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
