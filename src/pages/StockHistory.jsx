import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiBox,
  FiRefreshCw,
  FiFilter,
  FiDownload,
  FiPackage,
} from "react-icons/fi";
import { api } from "../api/client";
import { notify } from "../hooks/useToastNotify"; // ✅ dùng notify chung

export default function StockHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    reason: "all",
    startDate: "",
    endDate: "",
  });

  // 🔹 Load dữ liệu
  const load = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.reason !== "all") params.append("reason", filters.reason);
      if (filters.startDate) params.append("start", filters.startDate);
      if (filters.endDate) params.append("end", filters.endDate);

      const data = await api(`/stock/history?${params.toString()}`);
      setList(data);

      if (data.length === 0) {
        notify.info("Không có bản ghi phù hợp.");
      } else {
        notify.success(`✅ Đã tải ${data.length} bản ghi.`);
      }
    } catch (err) {
      console.error("❌ Lỗi load lịch sử:", err);
      notify.error("Không thể tải lịch sử kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔹 Xuất CSV
  const exportCSV = () => {
    if (!list.length) {
      notify.info("⚠️ Không có dữ liệu để xuất.");
      return;
    }

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

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `lich_su_kho_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    notify.success("📦 Đã xuất file CSV thành công!");
  };

  // ==================== UI =====================
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-md hover:shadow-xl transition"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiPackage className="text-blue-500" /> Lịch sử nhập / xuất kho
        </h2>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md font-medium text-sm transition"
        >
          <FiDownload /> Xuất CSV
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3 items-end mb-5">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Loại giao dịch
          </label>
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
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Từ ngày
          </label>
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
          <label className="block text-sm text-gray-600 dark:text-gray-300">
            Đến ngày
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
            className="border rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={load}
            className="btn flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <FiFilter /> Áp dụng
          </button>
          <button
            onClick={() => {
              setFilters({ reason: "all", startDate: "", endDate: "" });
              load();
            }}
            className="btn flex items-center gap-1 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">⏳ Đang tải dữ liệu...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500 italic">Chưa có lịch sử kho nào.</p>
      ) : (
        <div className="overflow-auto max-h-[550px] border rounded-lg">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Mã sản phẩm</th>
                <th className="p-2 text-left">Tên sản phẩm</th>
                <th className="p-2 text-left">Thương hiệu</th>
                <th className="p-2 text-center">Màu</th>
                <th className="p-2 text-center">Size</th>
                <th className="p-2 text-center">Thay đổi</th>
                <th className="p-2 text-center">Lý do</th>
                <th className="p-2 text-center">Ngày giờ</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-t ${
                    item.reason === "import"
                      ? "bg-green-50 dark:bg-green-900/30"
                      : "bg-red-50 dark:bg-red-900/30"
                  }`}
                >
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2 font-mono">{item.product_sku}</td>
                  <td className="p-2">{item.product_name}</td>
                  <td className="p-2">{item.brand || "-"}</td>
                  <td className="p-2 text-center">{item.color || "-"}</td>
                  <td className="p-2 text-center">{item.size || "-"}</td>
                  <td
                    className={`p-2 text-center font-semibold ${
                      item.change_qty > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.change_qty > 0
                      ? `+${item.change_qty}`
                      : item.change_qty}
                  </td>
                  <td className="p-2 text-center capitalize">
                    {item.reason === "import"
                      ? "Nhập hàng"
                      : item.reason === "order"
                        ? "Bán hàng"
                        : item.reason}
                  </td>
                  <td className="p-2 text-center text-gray-600 dark:text-gray-300">
                    {new Date(item.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
