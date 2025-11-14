function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

export default function CustomerStats({ stats }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="bg-blue-50 border rounded p-3 text-center">
        <div className="text-gray-500 text-sm">👥 Tổng khách hàng</div>
        <div className="text-2xl font-semibold text-blue-700">
          {stats.total_customers}
        </div>
      </div>
      <div className="bg-green-50 border rounded p-3 text-center">
        <div className="text-gray-500 text-sm">📦 Tổng số đơn</div>
        <div className="text-2xl font-semibold text-green-700">
          {stats.total_orders}
        </div>
      </div>
      <div className="bg-yellow-50 border rounded p-3 text-center">
        <div className="text-gray-500 text-sm">💰 Tổng doanh thu</div>
        <div className="text-2xl font-semibold text-yellow-700">
          {money(stats.total_revenue)}
        </div>
      </div>
    </div>
  );
}
