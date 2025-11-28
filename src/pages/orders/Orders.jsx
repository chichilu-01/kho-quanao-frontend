import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiZap,
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

  // 🔥 Tab cho MOBILE: "list" | "detail"
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    load();
  }, []);

  // 🔹 Tải danh sách đơn hàng
  const load = async () => {
    setLoading(true);
    try {
      const data = await api("/orders");
      setList(data);
    } catch (err) {
      console.error("❌ Lỗi load orders:", err);
      notify.error("❌ Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cập nhật trạng thái
  const updateStatus = async (rawStatus, id = null) => {
    const targetId = id || selected?.id;
    if (!targetId) return notify.error("⚠️ Chưa chọn đơn hàng!");

    const map = {
      pending: "pending",
      confirmed: "confirmed",
      shipping: "shipping",
      completed: "completed",
      cancelled: "cancelled",

      "Chờ xử lý": "pending",
      "Đã xác nhận": "confirmed",
      "Đang giao": "shipping",
      "Hoàn tất": "completed",
      "Đã huỷ": "cancelled",
      "Đã hủy": "cancelled",
    };

    const newStatus = map[rawStatus] || rawStatus;

    try {
      setUpdating(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/orders/${targetId}/status`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      notify.success(json.message || `Cập nhật đơn #${targetId} thành công`);

      await load();

      if (selected?.id === targetId) {
        const updated = (await api("/orders")).find((x) => x.id === targetId);
        setSelected(updated || null);
      }
    } catch (err) {
      notify.error("❌ " + (err.message || "Không thể cập nhật trạng thái"));
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Lọc danh sách
  const filtered = list.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      o.customer_name?.toLowerCase().includes(q) ||
      String(o.id).includes(q);
    const matchStatus =
      filterStatus === "all" ? true : o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // 🔹 Xuất CSV
  const exportCSV = () => {
    const header = ["ID", "Khách hàng", "Tổng tiền", "Trạng thái"];
    const rows = list.map((o) => [o.id, o.customer_name, o.total, o.status]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csvContent);
    a.download = "orders.csv";
    a.click();
    notify.success("📦 Đã xuất file orders.csv");
  };

  // 🔹 Hoàn tất tất cả đơn đang giao
  const completeAllShipping = async () => {
    const shipping = list.filter((o) => o.status === "shipping");
    if (!shipping.length) return notify.info("ℹ️ Không có đơn đang giao");

    for (const o of shipping) {
      await updateStatus("completed", o.id);
    }

    notify.success("✅ Đã hoàn tất tất cả đơn đang giao!");
  };

  return (
    <>
      {/* 🔥 TAB CHO MOBILE */}
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

      {/* 🔥 PC MODE — giữ nguyên */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
            <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <FiPackage className="text-blue-500" /> Danh sách đơn hàng
            </h3>

            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <FiDownload /> CSV
              </button>
              <button
                onClick={completeAllShipping}
                className="btn-outline text-sm text-green-600 flex items-center gap-1"
              >
                <FiZap /> Hoàn tất tất cả
              </button>
              <button
                onClick={load}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <FiRefreshCw /> Làm mới
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-3">
            <FiFilter className="text-gray-400 mt-2" />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn tất</option>
              <option value="cancelled">Đã huỷ</option>
            </select>

            <div className="flex items-center flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-2">
              <FiSearch className="text-gray-400" />
              <input
                className="flex-1 px-2 py-1 bg-transparent outline-none dark:text-gray-100"
                placeholder="Tìm ID hoặc tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <OrderList
            filtered={filtered}
            loading={loading}
            selected={selected}
            setSelected={setSelected}
          />
        </motion.div>

        {/* Order Detail */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <FiShoppingBag className="text-green-500" /> Chi tiết đơn hàng
          </h3>

          <OrderDetail
            selected={selected}
            updateStatus={updateStatus}
            updating={updating}
          />
        </motion.div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* 🔥 MOBILE LAYOUT – FULL SCREEN, NO CARD */}
      {/* --------------------------------------------------------------- */}
      <div className="md:hidden px-3 pt-[70px] pb-[80px]">
        {viewMode === "list" && (
          <div className="w-full">
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
          <div className="w-full">
            <OrderDetail
              selected={selected}
              updateStatus={updateStatus}
              updating={updating}
            />
          </div>
        )}
      </div>
    </>
  );
}
