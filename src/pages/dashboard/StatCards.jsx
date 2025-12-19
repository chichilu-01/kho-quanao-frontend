import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiArrowUpRight,
} from "react-icons/fi";

export default function StatCards({ stats }) {
  const cards = [
    {
      title: "Tổng Doanh Thu",
      value: (stats.monthRevenue || 0).toLocaleString("vi-VN") + "đ",
      icon: FiDollarSign,
      trend: "+12.5%", // Giả lập dữ liệu tăng trưởng
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
      trendColor: "text-green-500",
    },
    {
      title: "Đơn Hàng Mới",
      value: stats.orderCount || 0,
      icon: FiShoppingBag,
      trend: "+5.2%",
      color:
        "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
      trendColor: "text-green-500",
    },
    {
      title: "Khách Hàng Mới",
      value: stats.newCustomers || 0,
      icon: FiUsers,
      trend: "+2.4%",
      color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
      trendColor: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-200/50 dark:shadow-none transition-all duration-300"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${item.trendColor} bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg`}
            >
              <FiArrowUpRight /> {item.trend}
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
              {item.value}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">
              {item.title}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
