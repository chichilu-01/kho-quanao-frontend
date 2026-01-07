import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiFilter,
  FiSearch,
  FiShoppingBag,
  FiList,
} from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import OrderList from "./OrderList";
import OrderDetail from "./OrderDetail";

export default function Orders() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    load();
  }, []);

  const load = async (query = "") => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/orders?q=${encodeURIComponent(query)}`
        : "/orders";

      const data = await api(endpoint);
      setList(data);
    } catch (err) {
      console.error("❌ Lỗi load orders:", err);
      notify.error("❌ Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  const handleTrackingUpdate = (id, newCode) => {
    setList((prevList) =>
      prevList.map((o) =>
        o.id === id ? { ...o, china_tracking_code: newCode } : o,
      ),
    );
    if (selected && selected.id === id) {
      setSelected((prev) => ({ ...prev, china_tracking_code: newCode }));
    }
  };

  const updateStatus = async (rawStatus, id = null) => {
    const targetId = id || selected?.id;
    if (!targetId) return notify.error("⚠️ Chưa chọn đơn hàng!");

    const map = {
      pending: "pending",
      confirmed: "confirmed",
      shipping: "shipping",
      completed: "completed",
      cancelled: "cancelled",
    };
    const newStatus = map[rawStatus] || rawStatus;

    try {
      setUpdating(true);
      await api(`/orders/${targetId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      notify.success(`Cập nhật đơn #${targetId} thành công`);

      setList((prev) =>
        prev.map((o) => (o.id === targetId ? { ...o, status: newStatus } : o)),
      );
      if (selected?.id === targetId) {
        setSelected((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      notify.error("❌ Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const filtered = list.filter((o) => {
    return filterStatus === "all" ? true : o.status === filterStatus;
  });

  const exportCSV = () => {
    const header = [
      "ID",
      "Khách hàng",
      "Mã Vận Đơn",
      "Tổng tiền",
      "Trạng thái",
    ];
    const rows = list.map((o) => [
      o.id,
      o.customer_name,
      o.china_tracking_code || "",
      o.total,
      o.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csvContent);
    a.download = "orders.csv";
    a.click();
  };

  return (
    // 🔥 QUAN TRỌNG: h-[100dvh] + overflow-hidden để CẮT bỏ thanh cuộn ngoài cùng của Body
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-900 md:bg-transparent overflow-hidden">
      {/* MOBILE TAB HEADER - Fixed */}
      <div className="shrink-0 flex gap-2 p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden z-10">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
            viewMode === "list"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          <FiList /> Danh sách
        </button>

        <button
          disabled={!selected}
          onClick={() => selected && setViewMode("detail")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${
            viewMode === "detail"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          } ${!selected ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          <FiShoppingBag /> Chi tiết
        </button>
      </div>

      {/* PC MODE */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 animate-fadeIn h-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card flex flex-col overflow-hidden h-full"
        >
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3 shrink-0">
            <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <FiPackage className="text-blue-500" /> Đơn hàng
            </h3>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="btn-outline text-xs p-2">
                <FiDownload />
              </button>
              <button
                onClick={() => load(search)}
                className="btn-outline text-xs p-2"
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>

          <div className="space-y-2 mb-3 shrink-0">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 border border-transparent focus-within:border-blue-500 transition-all"
            >
              <FiSearch className="text-gray-400 mr-2" />
              <input
                className="flex-1 bg-transparent outline-none text-sm dark:text-gray-100 font-mono"
                placeholder="🔍 Nhập 4 số cuối mã vận đơn, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <div className="flex gap-2">
              <FiFilter className="text-gray-400 mt-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã huỷ</option>
              </select>
            </div>
          </div>

          {/* PC LIST - Thêm no-scrollbar nếu muốn ẩn cả trên PC */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <OrderList
              filtered={filtered}
              loading={loading}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card overflow-y-auto h-full"
        >
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-800 z-10 pb-2 border-b">
            <FiShoppingBag className="text-green-500" /> Chi tiết đơn hàng
          </h3>
          <OrderDetail
            selected={selected}
            updateStatus={updateStatus}
            updating={updating}
            onUpdateTracking={handleTrackingUpdate}
          />
        </motion.div>
      </div>

      {/* MOBILE LAYOUT - SẠCH SẼ, KHÔNG THANH CUỘN */}
      <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {viewMode === "list" && (
          <>
            {/* Thanh tìm kiếm - CỐ ĐỊNH */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 shrink-0 z-10">
              <form
                onSubmit={handleSearch}
                className="flex bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <input
                  className="flex-1 outline-none bg-transparent text-sm dark:text-gray-200"
                  placeholder="🔍 Tìm mã vận đơn..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="text-blue-600 px-2">
                  <FiSearch />
                </button>
              </form>
            </div>

            {/* 🔥 Đã thêm 'no-scrollbar' để ẩn thanh cuộn của danh sách */}
            <div className="flex-1 overflow-y-auto pb-20 px-1 scroll-smooth no-scrollbar">
              <OrderList
                filtered={filtered}
                loading={loading}
                selected={selected}
                setSelected={(o) => {
                  setSelected(o);
                  setViewMode("detail");
                }}
              />
            </div>
          </>
        )}

        {viewMode === "detail" && (
          // 🔥 Đã thêm 'no-scrollbar' để ẩn thanh cuộn của chi tiết
          <div className="flex-1 overflow-y-auto p-0 bg-white dark:bg-gray-800 pb-20 no-scrollbar">
            <OrderDetail
              selected={selected}
              updateStatus={updateStatus}
              updating={updating}
              onUpdateTracking={handleTrackingUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
