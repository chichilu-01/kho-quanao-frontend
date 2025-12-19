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

  // 🔹 Tải danh sách
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

      // ✅ SỬA LẠI CÚ PHÁP ĐÚNG
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
    <>
      {/* MOBILE TABS */}
      <div className="flex gap-2 p-3 md:hidden">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <FiList /> Danh sách
        </button>

        <button
          disabled={!selected}
          onClick={() => selected && setViewMode("detail")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
            viewMode === "detail"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500"
          } ${!selected ? "opacity-40" : ""}`}
        >
          <FiShoppingBag /> Chi tiết
        </button>
      </div>

      {/* PC MODE */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 animate-fadeIn h-[calc(100vh-100px)]">
        {/* CỘT TRÁI */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card flex flex-col overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
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

          <div className="space-y-2 mb-3">
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

          <div className="flex-1 overflow-y-auto">
            <OrderList
              filtered={filtered}
              loading={loading}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
        </motion.div>

        {/* CỘT PHẢI */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="card overflow-y-auto"
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

      {/* MOBILE LAYOUT */}
      <div className="md:hidden px-3 pt-[10px] pb-[80px]">
        {viewMode === "list" && (
          <div className="space-y-3">
            <form
              onSubmit={handleSearch}
              className="flex bg-white p-2 rounded shadow-sm"
            >
              <input
                className="flex-1 outline-none"
                placeholder="🔍 Tìm mã vận đơn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="text-blue-600">
                <FiSearch />
              </button>
            </form>
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
        )}
        {viewMode === "detail" && (
          <OrderDetail
            selected={selected}
            updateStatus={updateStatus}
            updating={updating}
            onUpdateTracking={handleTrackingUpdate}
          />
        )}
      </div>
    </>
  );
}
