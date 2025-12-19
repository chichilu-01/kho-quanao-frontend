import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import StatCards from "./StatCards";
import DashboardCharts from "./DashboardCharts";
import { FiRefreshCw } from "react-icons/fi"; // Thêm icon refresh

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (Phần logic load dữ liệu giữ nguyên như cũ)
  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [orders, customers, products] = await Promise.all([
        api("/orders"),
        api("/customers"),
        api("/products"),
      ]);

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const monthOrders = orders.filter((o) => {
        const d = new Date(o.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0);
      const orderCount = monthOrders.length;

      const newCustomers = customers.filter((c) => {
        const d = new Date(c.created_at);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;

      const dayMap = {};
      monthOrders.forEach((o) => {
        const day = new Date(o.created_at).getDate();
        dayMap[day] = (dayMap[day] || 0) + (o.total || 0);
      });
      const chartData = Object.entries(dayMap).map(([day, revenue]) => ({
        day: `${day}/${month + 1}`,
        revenue,
      }));

      const yearMap = {};
      orders.forEach((o) => {
        const d = new Date(o.created_at);
        if (d.getFullYear() === year) {
          const m = d.getMonth();
          yearMap[m] = (yearMap[m] || 0) + (o.total || 0);
        }
      });
      const months = [
        "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
        "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
      ];
      const yearlyData = months.map((m, i) => ({
        month: m,
        revenue: yearMap[i] || 0,
      }));

      const salesMap = {};
      orders.forEach((o) => {
        o.items?.forEach((it) => {
          const name = it.product_name;
          if (!salesMap[name]) salesMap[name] = { ...it, sold: 0 };
          salesMap[name].sold += it.quantity;
        });
      });
      const topProducts = Object.values(salesMap)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setStats({ monthRevenue, orderCount, newCustomers });
      setChartData(chartData);
      setYearlyData(yearlyData);
      setTopProducts(topProducts);

      if (!silent) notify.success("Dashboard cập nhật thành công!");
    } catch (err) {
      console.error("Dashboard error:", err);
      notify.error("Lỗi tải dữ liệu Dashboard");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 300000);
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="mt-4 text-gray-500 font-medium text-sm animate-pulse">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 lg:p-10 relative overflow-hidden">

      {/* Background Blobs (Abstract shapes) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply filter dark:mix-blend-normal dark:bg-purple-900/20"></div>
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-200/40 rounded-full blur-[100px] mix-blend-multiply filter dark:mix-blend-normal dark:bg-blue-900/20"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-pink-200/40 rounded-full blur-[120px] mix-blend-multiply filter dark:mix-blend-normal dark:bg-pink-900/20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="text-4xl font-black text-gray-800 dark:text-white tracking-tight"
            >
              Tổng quan <span className="text-blue-600">.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 0.2 }}
              className="text-gray-500 dark:text-gray-400 mt-2 font-medium"
            >
              Chào mừng trở lại, RinChan! Hôm nay bạn có tin tốt lành nào không? 🚀
            </motion.p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => load(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </motion.button>
        </div>

        {/* STATS CARDS SECTION */}
        <StatCards stats={stats} />

        {/* CHARTS SECTION */}
        <DashboardCharts 
          chartData={chartData} 
          yearlyData={yearlyData} 
          topProducts={topProducts} 
        />

      </div>
    </div>
  );
}