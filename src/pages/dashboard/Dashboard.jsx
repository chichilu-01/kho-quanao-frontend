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

  /* ---------- KEYFRAME CSS ---------- */
  if (typeof window !== "undefined") {
    if (!document.getElementById("welcome-anim")) {
      const style = document.createElement("style");
      style.id = "welcome-anim";
      style.innerHTML = `
        @keyframes textWave {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
        @keyframes textGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmerBorder {
          0% { background-position: -150% 0; }
          100% { background-position: 150% 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  const welcomeText = "Welcome, RinChan ✨";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative min-h-screen overflow-hidden">
      {/* BG */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        style={{ backgroundSize: "400% 400%", zIndex: -1 }}
      />

      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 relative z-10">

        {/* ⭐⭐⭐ WELCOME BOX + SHIMMER ⭐⭐⭐ */}
        <div className="relative flex flex-col items-center text-center mt-2 mb-6">

          {/* Viền sáng shimmer */}
          <div
            className="absolute -inset-1 rounded-2xl opacity-80"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmerBorder 2.2s linear infinite",
              filter: "blur(6px)",
            }}
          />

          <div className="relative bg-white/40 dark:bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-white/30">
            {/* LOGO */}
            <motion.img
              src="/icons/icon-192x192.png"
              alt="App Logo"
              className="w-20 h-20 object-contain drop-shadow-xl rounded-full mx-auto"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />

            {/* WELCOME TEXT - ANIMATION WAVE + GRADIENT MOVING */}
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-2xl font-extrabold"
              style={{
                background:
                  "linear-gradient(90deg, #2563eb, #7c3aed, #ec4899, #f97316)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                color: "transparent",
                animation: "textGradientMove 6s ease infinite",
              }}
            >
              {Array.from(welcomeText).map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    animation: "textWave 1.6s ease-in-out infinite",
                    animationDelay: `${i * 0.07}s`,
                  }}
                >
                  {ch}
                </span>
              ))}
            </motion.h2>

            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
              Chúc bạn một ngày làm việc tràn đầy năng lượng!
            </p>
          </div>
        </div>

        {/* TITLE */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 drop-shadow"
        >
          🚀 Tổng quan hoạt động
        </motion.h1>

        <StatCards stats={stats} topProducts={topProducts} />
        <DashboardCharts chartData={chartData} yearlyData={yearlyData} topProducts={topProducts} />
      </div>
    </motion.div>
  );
}
