import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiBox,
  FiArrowUp,
  FiArrowDown,
  FiActivity,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

// Helper format tiền tệ
const money = (val) => Number(val || 0).toLocaleString("vi-VN") + "đ";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orders = await api("/orders");
        const customers = await api("/customers");
        const products = await api("/products");

        // 1️⃣ SỬA LỖI CỘNG CHUỖI DOANH THU
        const revenue = orders.reduce(
          (sum, o) => sum + Number(o.total || 0),
          0,
        );

        // Giả lập dữ liệu biểu đồ
        const chartData = [
          { name: "T2", uv: 4000 },
          { name: "T3", uv: 3000 },
          { name: "T4", uv: 2000 },
          { name: "T5", uv: 2780 },
          { name: "T6", uv: 1890 },
          { name: "T7", uv: 2390 },
          { name: "CN", uv: 3490 },
        ];

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalCustomers: customers.length,
          totalProducts: products.length,
          recentOrders: orders.slice(0, 5),
          topProducts: products.slice(0, 4),
          chartData,
        });
      } catch (error) {
        console.error("Lỗi load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Skeleton Loading
  if (loading) {
    return (
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
        ))}
        <div className="md:col-span-2 lg:col-span-3 h-80 bg-gray-200 rounded-2xl mt-4"></div>
      </div>
    );
  }

  // Component Thẻ Chỉ Số
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between relative overflow-hidden group hover:shadow-md transition-all"
    >
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <div
          className={`flex items-center gap-1 text-xs font-bold mt-2 ${trend > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {trend > 0 ? <FiArrowUp /> : <FiArrowDown />}
          <span>{Math.abs(trend)}% so với tháng trước</span>
        </div>
      </div>
      <div
        className={`p-3 rounded-xl ${color} text-white shadow-lg transform group-hover:scale-110 transition-transform`}
      >
        <Icon size={24} />
      </div>
      <div
        className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${color}`}
      ></div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6 pb-24 md:pb-10">
      {/* 🆕 LOGO APP & TÊN SHOP (Gradient Gold - Hiện đại) */}
      <div className="md:hidden flex flex-col items-center justify-center mb-6 pt-4">
        <div className="relative">
          {/* Hiệu ứng hào quang (Glow) phía sau logo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur opacity-30 animate-pulse"></div>

          <img
            src="/icons/icon-192x192.png"
            alt="App Logo"
            className="relative h-20 w-auto object-contain drop-shadow-xl transform transition-transform duration-300"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {/* Tên Shop: Chữ màu loang (Gradient Text) */}
        <span className="mt-4 text-sm font-extrabold uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-600 drop-shadow-sm">
          Kho Quần Áo Rinchan
        </span>
      </div>

      {/* 1. HEADER: Lời chào (Đã nâng cấp UI) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            Xin chào, Admin!
            <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Hôm nay là một ngày tuyệt vời để chốt đơn! 🚀
          </p>
        </div>

        {/* Nút màu tối (Dark theme) cho sang trọng */}
        <button className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-500/20 transition-all flex items-center gap-2">
          <FiActivity /> Xem báo cáo
        </button>
      </div>

      {/* 2. GRID THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Tổng Doanh Thu"
          value={money(stats.totalRevenue)}
          icon={FiDollarSign}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend={12.5}
        />
        <StatCard
          title="Đơn Hàng Mới"
          value={stats.totalOrders}
          icon={FiShoppingBag}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend={8.2}
        />
        <StatCard
          title="Khách Hàng"
          value={stats.totalCustomers}
          icon={FiUsers}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend={-2.4}
        />
        <StatCard
          title="Sản Phẩm"
          value={stats.totalProducts}
          icon={FiBox}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          trend={5.1}
        />
      </div>

      {/* 3. BIỂU ĐỒ & TOP SẢN PHẨM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" /> Biểu đồ doanh thu
            </h3>
            <select className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-lg outline-none cursor-pointer">
              <option>7 ngày qua</option>
              <option>Tháng này</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Sản Phẩm */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            🏆 Top Sản Phẩm
          </h3>
          <div className="space-y-4">
            {stats.topProducts.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
              >
                <div
                  className={`
                  w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold text-white
                  ${idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-orange-400" : "bg-blue-100 text-blue-600"}
                `}
                >
                  {idx + 1}
                </div>

                <img
                  src={p.cover_image || p.image || "/no-image.png"}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  alt=""
                  onError={(e) => (e.target.src = "/no-image.png")}
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-700 truncate">
                    {p.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {p.sold_count || 0} đã bán
                  </p>
                </div>

                <span className="text-xs font-bold text-gray-800">
                  {money(p.price)}
                </span>
              </div>
            ))}

            {stats.topProducts.length === 0 && (
              <div className="text-center text-gray-400 text-xs py-10">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          <button className="w-full mt-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            Xem tất cả sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
