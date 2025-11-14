import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import StatCards from "./StatCards";
import DashboardCharts from "./DashboardCharts";

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

      if (!silent) notify.success("📊 Dashboard đã tải xong!");
      else notify.info("🔄 Dashboard tự động làm mới");
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
      className="relative min-h-screen overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        style={{ backgroundSize: "400% 400%", zIndex: -1 }}
      />

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 relative z-10">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 drop-shadow"
        >
          🚀 Tổng quan hoạt động
        </motion.h1>

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
