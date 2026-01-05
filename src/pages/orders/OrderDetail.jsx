import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  FiCalendar,
  FiLayers,
  FiPackage,
  FiTruck,
  FiSave,
  FiUser,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiCopy, // Thêm icon Copy
} from "react-icons/fi";
import { notify } from "../../hooks/useToastNotify";
import StatusIcon from "./StatusIcon";
import { api } from "../../api/client";

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

export default function OrderDetail({
  selected: propSelected,
  updateStatus: propUpdateStatus,
  updating,
  onUpdateTracking,
}) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [trackingCode, setTrackingCode] = useState("");
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Logic load dữ liệu
  useEffect(() => {
    const loadData = async () => {
      if (propSelected) {
        setOrder(propSelected);
        setTrackingCode(propSelected.china_tracking_code || "");
      } else {
        setLoading(true);
      }

      const targetId = id || propSelected?.id;

      if (targetId) {
        try {
          const fullData = await api(`/orders/${targetId}`);
          setOrder(fullData);
          setTrackingCode(fullData.china_tracking_code || "");
        } catch (err) {
          console.error(err);
          if (!propSelected)
            notify.error("❌ Không tìm thấy thông tin chi tiết đơn hàng");
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [id, propSelected]);

  // Cập nhật trạng thái
  const handleStatusChange = async (newStatus) => {
    if (propUpdateStatus) {
      propUpdateStatus(newStatus);
      return;
    }
    if (!order) return;
    try {
      await api(`/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      notify.success("Cập nhật trạng thái thành công");
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      notify.error("Lỗi cập nhật trạng thái");
    }
  };

  // Lưu mã vận đơn
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

  // --- TÍNH NĂNG COPY MỚI ---
  const handleCopy = (text, label) => {
    if (!text) {
      notify.error(`Không có ${label} để copy`);
      return;
    }
    navigator.clipboard.writeText(text);
    notify.success(`Đã copy ${label}!`);
  };

  const handleCopyFullShipInfo = () => {
    if (!order) return;
    // Format: Tên - SĐT - Địa chỉ
    const fullText = `${order.customer_name} - ${order.customer_phone} - ${
      order.customer_address || "Chưa có địa chỉ"
    }`;
    handleCopy(fullText, "thông tin giao hàng");
  };

  // --- RENDER ---

  if (loading && !order)
    return (
      <div className="p-10 text-center text-gray-500">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        ⏳ Đang tải dữ liệu...
      </div>
    );

  if (!order)
    return (
      <div className="text-gray-500 text-center py-10">
        ❌ Không tìm thấy đơn hàng
      </div>
    );

  const deposit = Number(order.deposit) || 0;
  const total = Number(order.total) || 0;
  const remaining = total - deposit;

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-10" // Padding bottom cho mobile
    >
      {/* HEADER chung */}
      <div className="flex justify-between items-start bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Đơn hàng #{order.id}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <FiCalendar /> {new Date(order.created_at).toLocaleString("vi-VN")}
          </div>
        </div>
        <StatusIcon status={order.status} />
      </div>

      {/* --- BỐ CỤC CHIA CỘT (GRID) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* === CỘT TRÁI (THÔNG TIN KHÁCH) === */}
        <div className="md:col-span-1 space-y-4 md:sticky md:top-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 border-b pb-3 mb-3">
              <FiUser className="text-blue-500" /> Khách hàng
            </h3>

            <div className="grid gap-4">
              {/* Tên */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                  {order.customer_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">
                    {order.customer_name}
                  </div>
                  <div className="text-xs text-gray-500">Khách hàng</div>
                </div>
              </div>

              {/* Số điện thoại (Có nút Copy) */}
              <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-center group">
                <div className="flex items-center gap-2">
                  <FiPhone className="text-gray-400" />
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="font-mono font-bold text-blue-600 text-base hover:underline"
                  >
                    {order.customer_phone || "—"}
                  </a>
                </div>
                <button
                  onClick={() =>
                    handleCopy(order.customer_phone, "Số điện thoại")
                  }
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Copy SĐT"
                >
                  <FiCopy />
                </button>
              </div>

              {/* Địa chỉ (Có nút Copy) */}
              <div className="bg-gray-50 p-2 rounded-lg flex justify-between items-start group">
                <div className="flex gap-2">
                  <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {order.customer_address || "Chưa cập nhật địa chỉ"}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(order.customer_address, "Địa chỉ")}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors flex-shrink-0 ml-1"
                  title="Copy Địa chỉ"
                >
                  <FiCopy />
                </button>
              </div>

              {/* NÚT COPY ALL - Quan trọng */}
              <button
                onClick={handleCopyFullShipInfo}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <FiCopy className="text-lg" /> COPY THÔNG TIN SHIP
              </button>
              <p className="text-xs text-center text-gray-400 italic">
                (Tên - SĐT - Địa chỉ)
              </p>
            </div>
          </div>
        </div>

        {/* === CỘT PHẢI (CHI TIẾT ĐƠN) === */}
        <div className="md:col-span-2 space-y-4">
          {/* Mã vận đơn & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mã Vận Đơn */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <FiTruck className="text-blue-600" />
                <span className="font-bold text-blue-800 text-sm uppercase">
                  Mã Vận Đơn (TQ)
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã..."
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase bg-white"
                />
                <button
                  onClick={handleSaveTracking}
                  disabled={isSavingTracking}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  {isSavingTracking ? "..." : <FiSave />}
                </button>
              </div>
            </div>

            {/* Đổi trạng thái */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FiLayers className="text-gray-500" />
                <span className="font-bold text-gray-700 text-sm">
                  Trạng thái đơn
                </span>
              </div>
              <select
                value={order.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn tất</option>
                <option value="cancelled">Đã huỷ</option>
              </select>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <FiPackage className="text-gray-500" />{" "}
              <span className="font-bold text-gray-700">Chi tiết sản phẩm</span>
            </div>
            <div className="p-2 space-y-2">
              {order.items?.map((it, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={it.cover_image || "/no-image.png"}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.src = "/no-image.png")}
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-medium text-gray-800 truncate">
                      {it.product_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 inline-flex gap-2">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {it.size}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {it.color}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <div className="font-bold text-gray-800">
                      {money(it.price)}
                    </div>
                    <div className="text-xs text-gray-500">x{it.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tổng kết tiền */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Tổng tiền hàng:</span>
              <span className="font-medium">{money(total)}</span>
            </div>

            <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded mb-3">
              <span>Đã đặt cọc:</span>
              <span>- {money(deposit)}</span>
            </div>

            <div className="border-t border-gray-200 my-3"></div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <FiDollarSign className="text-red-500 bg-red-100 rounded-full p-1 w-6 h-6" />
                CẦN THU (COD)
              </span>
              <span className="text-2xl font-extrabold text-red-600">
                {money(remaining)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
