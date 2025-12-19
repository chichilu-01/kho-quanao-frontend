import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { FiTrendingUp, FiBox, FiActivity } from "react-icons/fi";

export default function DashboardCharts({
  chartData,
  yearlyData,
  topProducts,
}) {
  // Custom Tooltip đẹp hơn
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold mb-1 opacity-70">{label}</p>
          <p className="text-base font-bold text-blue-400">
            {payload[0].value.toLocaleString()}đ
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 📊 CHART: Doanh thu theo ngày (Chiếm 8 cột) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-8 bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" /> Xu hướng doanh thu
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Dữ liệu theo ngày trong tháng hiện tại
            </p>
          </div>
          {/* Nút giả lập filter thời gian */}
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg">
              Ngày
            </button>
            <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
              Tuần
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "#3b82f6",
                  strokeWidth: 1,
                  strokeDasharray: "5 5",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#1d4ed8" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 🏆 LIST: Top sản phẩm (Chiếm 4 cột) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-4 bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
          <FiBox className="text-purple-500" /> Top Sản Phẩm
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FiBox size={40} className="mb-2 opacity-50" />
              <span className="text-sm">Chưa có dữ liệu</span>
            </div>
          ) : (
            topProducts.map((p, idx) => (
              <div key={idx} className="group flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shadow-inner flex-shrink-0">
                  <img
                    src={p.cover_image || "/no-image.png"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => (e.target.src = "/no-image.png")}
                  />
                  <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg">
                    #{idx + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate group-hover:text-purple-600 transition-colors">
                    {p.product_name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                      Đã bán: {p.sold}
                    </span>
                  </div>
                </div>
                {idx === 0 && <span className="text-xl">🥇</span>}
                {idx === 1 && <span className="text-xl">🥈</span>}
                {idx === 2 && <span className="text-xl">🥉</span>}
              </div>
            ))
          )}
        </div>

        <button className="mt-6 w-full py-3 text-sm font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
          Xem tất cả sản phẩm
        </button>
      </motion.div>

      {/* 📊 CHART: Tổng quan năm (Full width - 12 cột) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-12 bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <FiActivity className="text-pink-500" /> Hiệu suất năm nay
          </h3>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearlyData} barSize={32}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f3f4f6" }}
              />
              <Bar dataKey="revenue" radius={[8, 8, 8, 8]}>
                {yearlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#8b5cf6" : "#a78bfa"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
