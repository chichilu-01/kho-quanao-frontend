import { motion } from "framer-motion";
import { FiClock, FiPackage, FiCheckCircle, FiXCircle } from "react-icons/fi";

export const STATUS_STYLES = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  confirmed:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  shipping: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function StatusIcon({ status }) {
  switch (status) {
    case "pending":
      return (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <FiClock className="inline text-yellow-500 mr-1" />
        </motion.div>
      );
    case "confirmed":
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <FiPackage className="inline text-purple-500 mr-1" />
        </motion.div>
      );
    case "shipping":
      return (
        <motion.div
          className="inline-flex items-center"
          initial={{ x: -40 }}
          animate={{ x: [0, 60, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <span className="relative">
            🛵
            <motion.span
              className="absolute -top-1 left-3 text-blue-400"
              animate={{ opacity: [0, 1, 0], x: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              💨
            </motion.span>
          </span>
        </motion.div>
      );
    case "completed":
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <FiCheckCircle className="inline text-green-500 mr-1" />
        </motion.div>
      );
    case "cancelled":
      return (
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <FiXCircle className="inline text-red-500 mr-1" />
        </motion.div>
      );
    default:
      return null;
  }
}
