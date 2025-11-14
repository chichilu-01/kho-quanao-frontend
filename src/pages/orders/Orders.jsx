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

    if (!targetId) {
      notify.error("⚠️ Bạn cần chọn đơn hàng trước khi cập nhật trạng thái!");
      console.warn("❌ updateStatus không có ID:", { rawStatus, id, selected });
      return;
    }

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
      if (!res.ok) throw new Error(json.message || "Cập nhật thất bại");

      notify.success(json.message || `✅ Đã cập nhật đơn #${targetId}`);
      await load();

      // 🆙 Cập nhật lại chi tiết nếu đang xem đơn đó
      if (selected && selected.id === targetId) {
        const updated = (await api("/orders")).find((x) => x.id === targetId);
        setSelected(updated || null);
      }
    } catch (err) {
      console.error("❌ updateStatus error:", err);
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
    const shippingOrders = list.filter((o) => o.status === "shipping");
    if (shippingOrders.length === 0) {
      notify.info("ℹ️ Không có đơn hàng nào đang giao");
      return;
    }

    for (const o of shippingOrders) {
      await updateStatus("completed", o.id);
    }

    notify.success("✅ Đã hoàn tất tất cả đơn đang giao!");
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4 animate-fadeIn">
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
              <FiDownload /> Xuất CSV
            </button>
            <button
              onClick={completeAllShipping}
              className="btn-outline text-sm text-green-600 flex items-center gap-1"
            >
              <FiZap /> Hoàn tất tất cả đang giao
            </button>
            <button
              onClick={load}
              className="btn-outline text-sm flex items-center gap-1"
            >
              <FiRefreshCw /> Làm mới
            </button>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="flex gap-2 mb-3">
          <FiFilter className="text-gray-400 mt-2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Tất cả trạng thái</option>
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
              placeholder="Tìm theo ID hoặc tên khách hàng..."
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
  );
}
