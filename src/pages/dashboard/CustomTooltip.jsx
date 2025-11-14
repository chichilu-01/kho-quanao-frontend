import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { money } from "../../utils/format";

export default function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 text-sm">
          <FiStar className="text-yellow-400" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {label}
          </span>
        </div>
        <p className="text-blue-500 dark:text-blue-400 font-bold mt-1">
          {money(payload[0].value)}
        </p>
      </motion.div>
    );
  }
  return null;
}
