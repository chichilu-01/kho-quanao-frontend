import { useEffect, useState, useRef } from "react"; // 1. Thêm useRef
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

// 2. Import Context để điều khiển thanh menu dưới
import { useNav } from "../../context/NavContext";

export default function Orders() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // 3. Khai báo hook xử lý ẩn/hiện menu
  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  useEffect(() => {
    load();
    // Reset menu luôn hiện khi vừa vào trang
    setIsNavVisible(true);
  }, []);

  // 4. Hàm logic phát hiện cuộn lên/xuống
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;

    // Bỏ qua nảy trên iOS
    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      // Cuộn xuống -> Ẩn Menu
      setIsNavVisible(false);
    } else if (currentScrollY < lastScrollY.current) {
      // Cuộn lên -> Hiện Menu
      setIsNavVisible(true);
    }

    lastScrollY.current = currentScrollY;
  };

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
    if (viewMode !== "list") setViewMode("list");
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
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-900 md:bg-transparent overflow-hidden">
      {/* ======================================================== */}
      {/* 🔥 MOBILE HEADER: TÌM KIẾM + TAB NẰM CHUNG 1 HÀNG 🔥 */}
      {/* ======================================================== */}
      <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden z-20 shadow-sm">
        {/* 1. Ô TÌM KIẾM */}
        <form
          onSubmit={handleSearch}
          className="flex-1 flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl transition-all focus-within:ring-2 focus-within:ring-blue-400"
        >
          <input
            className="flex-1 outline-none bg-transparent text-sm dark:text-gray-100 min-w-0"
            placeholder="🔍 Tìm mã vận đơn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                load("");
              }}
              className="text-gray-400 text-xs ml-2"
            >
              ✕
            </button>
          )}
        </form>

        {/* 2. CỤM NÚT CHUYỂN TAB */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                : "text-gray-400"
            }`}
          >
            <FiList className="text-lg" />
          </button>

          <button
            disabled={!selected}
            onClick={() => selected && setViewMode("detail")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "detail"
                ? "bg-white dark:bg-gray-600 text-blue-600 shadow-sm"
                : "text-gray-400"
            } ${!selected ? "opacity-30" : ""}`}
          >
            <FiShoppingBag className="text-lg" />
          </button>
        </div>
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

      {/* MOBILE CONTENT BODY */}
      <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {viewMode === "list" && (
          // 5. Thêm onScroll={handleScroll} vào đây để bắt sự kiện cuộn
          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pb-0 px-1 scroll-smooth no-scrollbar"
          >
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
          // 6. Thêm onScroll={handleScroll} vào cả đây
          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-0 bg-white dark:bg-gray-800 pb-0 no-scrollbar"
          >
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
