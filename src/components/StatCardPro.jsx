import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function StatCardPro({ icon, label, value, color = "blue" }) {
  const colors = {
    blue: "text-blue-500 bg-blue-100 dark:bg-blue-900/40",
    green: "text-green-500 bg-green-100 dark:bg-green-900/40",
    purple: "text-purple-500 bg-purple-100 dark:bg-purple-900/40",
    orange: "text-orange-500 bg-orange-100 dark:bg-orange-900/40",
  };

  const gradients = {
    blue: "from-blue-500/10 to-blue-500/0",
    green: "from-green-500/10 to-green-500/0",
    purple: "from-purple-500/10 to-purple-500/0",
    orange: "from-orange-500/10 to-orange-500/0",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05, rotate: 0.3 }}
      className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
                  rounded-2xl shadow-md overflow-hidden p-5 flex items-center gap-4
                  border border-gray-100 dark:border-gray-700 transition-transform`}
    >
      {/* 🌈 Hiệu ứng gradient nền nhịp nhẹ */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} pointer-events-none`}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />

      {/* 💫 Hiệu ứng ánh sáng quét ngang */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
      />

      {/* 🌀 Icon */}
      <div
        className={`relative z-10 p-3 rounded-full ${colors[color]} shadow-sm
                    group-hover:shadow-lg group-hover:scale-105 transition-transform`}
      >
        {icon}
      </div>

      {/* 🔢 Nội dung */}
      <div className="relative z-10">
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {label}
        </p>

        {value == null ? (
          // Skeleton shimmer khi chưa có dữ liệu
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ) : (
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-800 dark:text-gray-100">
            <CountUp
              end={typeof value === "number" ? value : parseFloat(value) || 0}
              duration={1.2}
              separator=","
            />
          </h3>
        )}
      </div>
    </motion.div>
  );
}
