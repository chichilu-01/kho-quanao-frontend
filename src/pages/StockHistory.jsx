import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiPackage,
  FiCalendar,
  FiGrid,
  FiList,
  FiClock,
} from "react-icons/fi";
import { api } from "../api/client";
import { notify } from "../hooks/useToastNotify";

export default function StockHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    reason: "all",
    startDate: "",
    endDate: "",
  });

  const [viewMode, setViewMode] = useState("timeline");

  const load = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.reason !== "all") params.append("reason", filters.reason);
      if (filters.startDate) params.append("start", filters.startDate);
      if (filters.endDate) params.append("end", filters.endDate);

      const data = await api(`/stock/history?${params.toString()}`);
      setList(data);

      if (data.length === 0) notify.info("Không có bản ghi phù hợp.");
      else notify.success(`Đã tải ${data.length} bản ghi.`);
    } catch (err) {
      notify.error("Không thể tải lịch sử kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    list.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      if (!map[date]) map[date] = [];
      map[date].push(item);
    });

    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({ date, items }));
  }, [list]);

  const exportCSV = () => {
    if (!list.length) return notify.info("Không có dữ liệu để xuất.");

    const header = [
      "STT",
      "Mã sản phẩm",
      "Tên sản phẩm",
      "Thương hiệu",
      "Màu",
      "Size",
      "Thay đổi",
      "Lý do",
      "Ngày giờ",
    ].join(",");

    const rows = list.map((item, idx) => {
      const reasonText =
        item.reason === "import"
          ? "Nhập hàng"
          : item.reason === "order"
            ? "Bán hàng"
            : item.reason;

      const date = new Date(item.created_at).toLocaleString("vi-VN");

      return [
        idx + 1,
        item.product_sku,
        `"${item.product_name}"`,
        item.brand || "-",
        item.color || "-",
        item.size || "-",
        item.change_qty,
        reasonText,
        date,
      ].join(",");
    });

    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lich_su_kho_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    notify.success("Đã xuất file CSV!");
  };

  const CardItem = ({ item }) => (
    <div className="p-4 rounded-xl border bg-white dark:bg-gray-800 shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <div className="font-semibold text-gray-800 dark:text-gray-100">
          {item.product_name}
        </div>
        <span
          className={`text-sm font-bold ${
            item.change_qty > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.change_qty > 0 ? `+${item.change_qty}` : item.change_qty}
        </span>
      </div>

      <div className="text-sm text-gray-500">
        SKU: {item.product_sku} • {item.color || "-"} • {item.size || "-"}
      </div>

      <div className="text-xs text-gray-400">
        {item.reason === "import" ? "Nhập hàng" : "Bán hàng"} —{" "}
        {new Date(item.created_at).toLocaleString("vi-VN")}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-2xl border shadow-md"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiPackage className="text-blue-500" /> Lịch sử kho
        </h2>

        {/* TOGGLE VIEW ONLY */}
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <FiList /> Table
          </button>

          <button
            onClick={() => setViewMode("timeline")}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
              viewMode === "timeline"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <FiClock /> Timeline
          </button>

          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
              viewMode === "card"
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300"
            }`}
          >
            <FiGrid /> Card
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 items-end mb-5 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border">
        <div>
          <label className="block text-sm">Loại giao dịch</label>
          <select
            value={filters.reason}
            onChange={(e) =>
              setFilters((f) => ({ ...f, reason: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">Tất cả</option>
            <option value="import">Nhập hàng</option>
            <option value="order">Bán hàng</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Từ ngày</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, startDate: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm">Đến ngày</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        {/* APPLY + RESET + CSV */}
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <FiFilter /> Áp dụng
          </button>

          <button
            onClick={() => {
              setFilters({ reason: "all", startDate: "", endDate: "" });
              load();
            }}
            className="flex items-center gap-1 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg shadow"
          >
            <FiRefreshCw /> Reset
          </button>

          {/* CSV moved here */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow"
          >
            <FiDownload /> CSV
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-gray-500">⏳ Đang tải...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 italic">Không có lịch sử.</p>
      ) : (
        <>
          {/* TABLE */}
          {viewMode === "table" && (
            <div className="overflow-auto border rounded-xl shadow">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Tên</th>
                    <th className="p-2">Thay đổi</th>
                    <th className="p-2">Màu</th>
                    <th className="p-2">Size</th>
                    <th className="p-2">Lý do</th>
                    <th className="p-2">Thời gian</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((item, idx) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="p-2 text-center">{idx + 1}</td>
                      <td className="p-2">{item.product_name}</td>
                      <td
                        className={`p-2 text-center font-semibold ${
                          item.change_qty > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.change_qty > 0
                          ? `+${item.change_qty}`
                          : item.change_qty}
                      </td>
                      <td className="p-2 text-center">{item.color || "-"}</td>
                      <td className="p-2 text-center">{item.size || "-"}</td>
                      <td className="p-2 text-center">
                        {item.reason === "import" ? "Nhập hàng" : "Bán hàng"}
                      </td>
                      <td className="p-2 text-center text-gray-600">
                        {new Date(item.created_at).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TIMELINE */}
          {viewMode === "timeline" && (
            <div className="space-y-6">
              {grouped.map((group) => (
                <div
                  key={group.date}
                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiCalendar className="text-blue-500" />
                    <span className="font-medium text-gray-800">
                      {new Date(group.date).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-gray-500">
                            SKU: {item.product_sku} | {item.color || "-"} |{" "}
                            {item.size || "-"}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-semibold ${
                              item.change_qty > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.change_qty > 0
                              ? `+${item.change_qty}`
                              : item.change_qty}
                          </div>
                          <div className="text-xs">
                            {item.reason === "import" ? "Nhập kho" : "Bán hàng"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleTimeString(
                              "vi-VN",
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CARD */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {list.map((item) => (
                <CardItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
