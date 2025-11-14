import { motion } from "framer-motion";

export default function MobileTabs({ options, viewMode, setViewMode }) {
  return (
    <div
      className="
      md:hidden 
      sticky top-0 z-40 
      bg-white/90 dark:bg-gray-900/90 
      backdrop-blur-md 
      px-3 py-2 
      border-b border-gray-200 dark:border-gray-700
    "
    >
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = viewMode === opt.value;

          return (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.96 }}
              disabled={opt.disabled}
              onClick={() => {
                if (!opt.disabled) {
                  opt.onClick?.();
                  setViewMode(opt.value);
                }
              }}
              className={`
                flex-1 flex items-center justify-center gap-1 
                py-2.5 rounded-xl font-medium text-sm transition-all
                border 
                ${
                  active
                    ? "bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700"
                }
                ${opt.disabled ? "opacity-40" : "active:scale-95"}
              `}
            >
              {opt.icon && (
                <opt.icon
                  size={17}
                  className={
                    active ? "text-white" : "text-gray-500 dark:text-gray-400"
                  }
                />
              )}
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
