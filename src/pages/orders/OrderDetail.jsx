import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom"; // ✅ Thêm useParams
import {
  FiCalendar,
  FiLayers,
  FiPackage,
  FiTruck,
  FiSave,
} from "react-icons/fi";
import { notify } from "../../hooks/useToastNotify";
import StatusIcon from "./StatusIcon";
import { api } from "../../api/client";

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

// Đổi tên prop selected -> propSelected để tránh trùng
export default function OrderDetail({
  selected: propSelected,
  updateStatus: propUpdateStatus,
  updating,
  onUpdateTracking,
}) {
  const { id } = useParams(); // ✅ Lấy ID từ URL (nếu chạy độc lập)
  const [order, setOrder] = useState(null); // State lưu đơn hàng hiển thị
  const [trackingCode, setTrackingCode] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Ưu tiên dùng data từ Props, nếu không có thì set null để fetch sau
  useEffect(() => {
    if (propSelected) {
      setOrder(propSelected);
      setTrackingCode(propSelected.china_tracking_code || "");
    } else {
      setOrder(null);
    }
  }, [propSelected]);

  // 2️⃣ Nếu không có Props nhưng có ID trên URL -> Tự gọi API
  useEffect(() => {
    if (!propSelected && id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const data = await api(`/orders/${id}`);
          setOrder(data);
          setTrackingCode(data.china_tracking_code || "");
        } catch (err) {
          notify.error("❌ Không tìm thấy đơn hàng");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, propSelected]);

  // 3️⃣ Hàm xử lý cập nhật trạng thái (Hỗ trợ cả 2 chế độ)
  const handleStatusChange = async (newStatus) => {
    // Nếu có prop update từ cha thì dùng luôn
    if (propUpdateStatus) {
      propUpdateStatus(newStatus);
      return;
    }

    // Nếu chạy độc lập thì tự gọi API update status
    if (!order) return;
    try {
      await api(`/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      notify.success("Cập nhật trạng thái thành công");
      setOrder({ ...order, status: newStatus }); // Update UI local
    } catch (err) {
      notify.error("Lỗi cập nhật trạng thái");
    }
  };

  // 4️⃣ Hàm lưu mã vận đơn
  const handleSaveTracking = async () => {
    if (!order) return;
    if (trackingCode === (order.china_tracking_code || "")) return;

    try {
      setIsSavingTracking(true);
      await api(`/orders/${order.id}/tracking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ china_tracking_code: trackingCode }),
      });

      notify.success("✅ Đã lưu mã vận đơn!");

      // Update UI local
      setOrder({ ...order, china_tracking_code: trackingCode });

      if (onUpdateTracking) {
        onUpdateTracking(order.id, trackingCode);
      }
    } catch (error) {
      console.error(error);
      notify.error("❌ Lỗi khi lưu mã vận đơn");
    } finally {
      setIsSavingTracking(false);
    }
  };

  // --- GIAO DIỆN ---

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        ⏳ Đang tải dữ liệu đơn hàng...
      </div>
    );

  if (!order)
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-10">
        {id
          ? "❌ Không tìm thấy đơn hàng"
          : "👈 Chọn một đơn hàng để xem chi tiết."}
      </div>
    );

  const orderCover =
    order?.items?.[0]?.cover_image ||
    order?.items?.[0]?.product?.cover_image ||
    "/no-image.png";

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* HEADER + ẢNH */}
      <motion.div className="rounded-2xl p-4 flex gap-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-700 shadow-lg">
        <div className="relative">
          <img
            src={orderCover}
            className="w-20 h-20 rounded-xl object-cover shadow-md"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                #{order.id}
              </div>
              <div className="text-sm text-gray-500">{order.customer_name}</div>
            </div>
            <StatusIcon status={order.status} />
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-300">
            <FiCalendar />
            {new Date(order.created_at).toLocaleString("vi-VN")}
          </div>
        </div>
      </motion.div>

      {/* MÃ VẬN ĐƠN */}
      <motion.div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 shadow-sm border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <FiTruck className="text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm uppercase">
            Mã Vận Đơn (Trung Quốc)
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste mã tracking..."
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 font-mono"
          />
          <button
            onClick={handleSaveTracking}
            disabled={isSavingTracking}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm disabled:opacity-50 transition-colors"
          >
            {isSavingTracking ? (
              "Lưu..."
            ) : (
              <>
                <FiSave /> Lưu
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* TRẠNG THÁI */}
      <motion.div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 mb-1">Trạng thái đơn hàng</div>
        <div className="flex items-center gap-2">
          <FiLayers className="text-gray-400" />
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border dark:bg-gray-800 dark:border-gray-700 outline-none"
          >
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn tất</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
        </div>
      </motion.div>

      {/* SẢN PHẨM */}
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          <FiPackage /> Sản phẩm trong đơn
        </h4>
        {order.items?.map((it, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 p-3 mb-2 rounded-xl border bg-white dark:bg-gray-800 shadow-sm dark:border-gray-700"
          >
            <div className="relative">
              {it.cover_image ? (
                <img
                  src={it.cover_image}
                  className="w-14 h-14 rounded-lg object-cover shadow"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 dark:text-gray-100">
                {it.product_name}
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                SL: {it.quantity} × {money(it.price)} <br />
                <span className="text-gray-400">
                  {it.size} - {it.color}
                </span>
              </div>
            </div>
            <div className="font-bold text-green-600 dark:text-green-400">
              {money(it.quantity * it.price)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* TỔNG TIỀN */}
      <div className="text-right text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-transparent bg-clip-text">
        Tổng cộng: {money(order.total)}
      </div>
    </motion.div>
  );
}
