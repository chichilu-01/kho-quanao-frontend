// src/pages/dashboard/StatCards.jsx
import { motion } from "framer-motion";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
import StatCardPro from "../../components/StatCardPro"; // ✅ đặt đúng tên file
import { money } from "../../utils/format";

export default function StatCards({ stats, topProducts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-5"
    >
      <StatCardPro
        icon={<FiDollarSign className="animate-pulse text-blue-500" />}
        label="Doanh thu tháng"
        value={money(stats?.monthRevenue || 0)}
        color="blue"
      />
      <StatCardPro
        icon={<FiShoppingBag className="text-green-500 animate-bounce" />}
        label="Đơn hàng"
        value={stats?.orderCount || 0}
        color="green"
      />
      <StatCardPro
        icon={<FiUsers className="text-purple-500 animate-pulse" />}
        label="Khách hàng mới"
        value={stats?.newCustomers || 0}
        color="purple"
      />
      <StatCardPro
        icon={<FiTrendingUp className="text-orange-500 animate-bounce" />}
        label="Sản phẩm hot"
        value={topProducts?.length || 0}
        color="orange"
      />
    </motion.div>
  );
}
