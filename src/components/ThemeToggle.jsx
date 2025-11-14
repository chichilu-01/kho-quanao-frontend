import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle({ small = false }) {
  const getInitialTheme = () => {
    if ("theme" in localStorage) return localStorage.theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [dark, setDark] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.theme = dark ? "dark" : "light";
  }, [dark]);

  // 🍀 Style nhỏ dành cho BottomNav (mobile)
  if (small) {
    return (
      <motion.button
        onClick={() => setDark(!dark)}
        whileTap={{ scale: 0.85 }}
        className="w-11 h-11 flex items-center justify-center rounded-full bg-black/80 border border-yellow-500/40 shadow-md"
      >
        <AnimatePresence mode="wait" initial={false}>
          {dark ? (
            <motion.span
              key="sun-mini"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FiSun className="text-yellow-400 text-xl" />
            </motion.span>
          ) : (
            <motion.span
              key="moon-mini"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FiMoon className="text-blue-400 text-xl" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // ⭐ Phiên bản lớn (PC)
  return (
    <motion.button
      onClick={() => setDark(!dark)}
      whileTap={{ scale: 0.9 }}
      className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all border ${
        dark
          ? "border-yellow-500 text-yellow-400 bg-gray-900 hover:bg-gray-800"
          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
      } shadow-sm`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <FiSun className="text-yellow-400" /> <span>Sáng</span>
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <FiMoon className="text-blue-500" /> <span>Tối</span>
          </motion.span>
        )}
      </AnimatePresence>

      {dark && (
        <motion.div
          className="absolute inset-0 rounded-full bg-yellow-500/10 blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}
    </motion.button>
  );
}
