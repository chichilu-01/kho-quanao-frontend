import { motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import CustomTooltip from "./CustomTooltip";

const COLORS = ["#3B82F6", "#22C55E", "#F97316", "#8B5CF6", "#EAB308"];

export default function DashboardCharts({ chartData, yearlyData, topProducts }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          💵 Doanh thu theo ngày
        </h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            📅 Doanh thu 12 tháng
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            🥇 Top sản phẩm bán chạy
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={topProducts} dataKey="sold" nameKey="product_name" outerRadius={90} label>
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </>
  );
}
