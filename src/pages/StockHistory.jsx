import { useEffect, useState, useMemo, useRef } from "react";
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
// 1. Import Context
import { useNav } from "../context/NavContext";

export default function StockHistory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    reason: "all",
    startDate: "",
    endDate: "",
  });

  const [viewMode, setViewMode] = useState("timeline");

  // 2. Setup Hook ẩn hiện Menu
  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  // 3. Logic xử lý cuộn
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else if (currentScrollY < lastScrollY.current) {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    setIsNavVisible(true);
    load();
  }, []);

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
    } catch (err) {
      notify.error("Không thể tải lịch sử kho!");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
          {item.product_name}
        </div>
        <span
          className={`text-sm font-bold flex-shrink-0 ml-2 ${
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
    <>
      <style>{`
        .hide-scroll-force::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scroll-force { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* CONTAINER CHÍNH */}
      <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">

        {/* HEADER CỐ ĐỊNH */}
        <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <FiPackage className="text-blue-500" /> Lịch sử kho
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
              {['table', 'timeline', 'card'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === mode ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {mode === 'table' && <FiList />}
                  {mode === 'timeline' && <FiClock />}
                  {mode === 'card' && <FiGrid />}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER BAR - Responsive */}
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filters.reason}
              onChange={(e) => setFilters((f) => ({ ...f, reason: e.target.value }))}
              className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="import">Nhập hàng</option>
              <option value="order">Bán hàng</option>
            </select>

            <button onClick={load} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
              <FiRefreshCw />
            </button>

            <button onClick={exportCSV} className="ml-auto flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100">
              <FiDownload /> <span className="hidden sm:inline">Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG CUỘN */}
        <div 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto hide-scroll-force p-4 pb-24 md:pb-10"
        >
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-10 text-gray-400">⏳ Đang tải dữ liệu...</div>
            ) : list.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Không có lịch sử nào.</div>
            ) : (
              <>
                {/* TABLE VIEW */}
                {viewMode === "table" && (
                  <div className="overflow-hidden border rounded-xl shadow-sm bg-white dark:bg-gray-800">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                          <tr>
                            <th className="p-3">Tên SP</th>
                            <th className="p-3 text-center">SL</th>
                            <th className="p-3">Loại</th>
                            <th className="p-3 text-right">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {list.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="p-3">
                                <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px] sm:max-w-none">
                                  {item.product_name}
                                </div>
                                <div className="text-xs text-gray-400">SKU: {item.product_sku}</div>
                              </td>
                              <td className={`p-3 text-center font-bold ${item.change_qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change_qty > 0 ? `+${item.change_qty}` : item.change_qty}
                              </td>
                              <td className="p-3 text-xs">
                                <span className={`px-2 py-1 rounded-full ${item.reason === 'import' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {item.reason === 'import' ? 'Nhập' : 'Bán'}
                                </span>
                              </td>
                              <td className="p-3 text-right text-gray-500 text-xs">
                                {new Date(item.created_at).toLocaleString("vi-VN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TIMELINE VIEW */}
                {viewMode === "timeline" && (
                  <div className="space-y-6">
                    {grouped.map((group) => (
                      <div key={group.date} className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900"></div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 pl-2">
                          {new Date(group.date).toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <div className="space-y-3">
                          {group.items.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start">
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{item.product_name}</div>
                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                  <span>{new Date(item.created_at).toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span>•</span>
                                  <span className="uppercase">{item.reason === 'import' ? 'Nhập kho' : 'Xuất kho'}</span>
                                </div>
                              </div>
                              <span className={`font-bold text-sm ${item.change_qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {item.change_qty > 0 ? `+${item.change_qty}` : item.change_qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CARD VIEW */}
                {viewMode === "card" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {list.map((item) => (
                      <CardItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}