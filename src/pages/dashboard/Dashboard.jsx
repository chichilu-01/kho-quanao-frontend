import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import StatCards from "./StatCards";
import DashboardCharts from "./DashboardCharts";
import { FiRefreshCw, FiBell } from "react-icons/fi"; // Thêm icon chuông thông báo

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        "Th1",
        "Th2",
        "Th3",
        "Th4",
        "Th5",
        "Th6",
        "Th7",
        "Th8",
        "Th9",
        "Th10",
        "Th11",
        "Th12",
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

      if (!silent) notify.success("📊 Dashboard đã cập nhật!");
    } catch (err) {
      console.error("❌ Dashboard error:", err);
      notify.error("Không thể tải dữ liệu Dashboard!");
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
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 pointer-events-none" />

      <div className="p-4 sm:p-6 space-y-6 relative z-10 max-w-7xl mx-auto">
        {/* ⭐⭐⭐ HEADER BAR: LOGO & ACTIONS ⭐⭐⭐ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          {/* LOGO AREA */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 flex items-center justify-center">
              <img
                src="/icons/icon-192x192.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight leading-none">
                ChiChiLu<span className="text-blue-500">.</span>
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Kho Hàng & Đơn Vận
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 hover:text-blue-600 transition-colors relative">
              <FiBell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <button
              onClick={() => load(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-semibold text-sm"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* ⭐ WELCOME MESSAGE (Gọn gàng hơn) */}
        {/* ⭐ WELCOME MESSAGE (Font uốn lượn) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 transform origin-bottom-left" />
          <div className="relative z-10">
            {/* Áp dụng font Dancing Script ở đây */}
            <h2 className="text-3xl sm:text-5xl font-bold mb-2 font-['Dancing_Script'] tracking-wide">
              Xin chào, RinChan! 👋
            </h2>
            <p className="text-blue-100 font-medium text-sm sm:text-base">
              Hôm nay bạn có tin tốt lành nào không? Cùng kiểm tra chỉ số nhé.
            </p>
          </div>
        </motion.div>

        {/* --- MAIN CONTENT --- */}

        {/* Title Section */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Tổng quan hoạt động
          </h3>
        </div>

        <StatCards stats={stats} topProducts={topProducts} />

        <DashboardCharts
          chartData={chartData}
          yearlyData={yearlyData}
          topProducts={topProducts}
        />
      </div>
    </motion.div>
  );
}
