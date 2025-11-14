import { motion } from "framer-motion";

export default function MobileTabs({ options, viewMode, setViewMode }) {
  return (
    <div
      className="
        md:hidden
        fixed top-0 left-0 right-0 z-40
        bg-white dark:bg-gray-900
        px-3 py-2
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }} // iPhone safe zone
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
                ${
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }
                ${opt.disabled ? "opacity-40" : ""}
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
