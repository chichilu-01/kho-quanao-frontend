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

  // 1️⃣ Ưu tiên dùng data từ Props (nếu mở từ danh sách)
  useEffect(() => {
    if (propSelected) {
      setOrder(propSelected);
      setTrackingCode(propSelected.china_tracking_code || "");
    } else {
      setOrder(null);
    }
  }, [propSelected]);

  // 2️⃣ Nếu F5 hoặc vào trực tiếp link -> Tự gọi API để lấy FULL thông tin (SĐT, Cọc...)
  useEffect(() => {
    if (!propSelected && id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          // Gọi API Backend mà bạn vừa sửa xong
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

  // 3️⃣ Cập nhật trạng thái
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

  // 4️⃣ Lưu mã vận đơn
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

  // --- RENDER ---

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        ⏳ Đang tải dữ liệu...
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

  // 🧮 TÍNH TOÁN TIỀN (Hiển thị phần Tiền cọc & Còn lại)
  const deposit = Number(order.deposit || 0); // Lấy từ Backend
  const total = Number(order.total || 0);
  const remaining = total - deposit; // Tiền Shipper cần thu

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* 🟢 HEADER */}
      <div className="flex justify-between items-start bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Đơn hàng #{order.id}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <FiCalendar /> {new Date(order.created_at).toLocaleString("vi-VN")}
          </div>
        </div>
        <StatusIcon status={order.status} />
      </div>

      {/* 🟠 THÔNG TIN KHÁCH HÀNG (SĐT, Địa chỉ) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2 border-b pb-2">
          <FiUser className="text-blue-500" /> Thông tin khách hàng
        </h3>

        <div className="grid gap-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-5 text-gray-400 mt-0.5">
              <FiUser />
            </div>
            <div className="font-semibold text-gray-800 dark:text-gray-100 text-base">
              {order.customer_name}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 text-gray-400 mt-0.5">
              <FiPhone />
            </div>
            <div className="text-blue-600 font-mono font-bold text-base">
              {order.customer_phone || "—"}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-5 text-gray-400 mt-0.5">
              <FiMapPin />
            </div>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {order.customer_address || "Chưa cập nhật địa chỉ"}
            </div>
          </div>
        </div>
      </div>

      {/* 🟡 MÃ VẬN ĐƠN */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <FiTruck className="text-blue-600" />
          <span className="font-bold text-blue-800 dark:text-blue-200 text-sm uppercase">
            Mã Vận Đơn (Trung Quốc)
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập mã tracking..."
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase bg-white"
          />
          <button
            onClick={handleSaveTracking}
            disabled={isSavingTracking}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm whitespace-nowrap"
          >
            {isSavingTracking ? (
              "..."
            ) : (
              <>
                <FiSave /> Lưu
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🟣 TRẠNG THÁI */}
      <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl flex items-center gap-3 border border-gray-200">
        <FiLayers className="text-gray-500" />
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Trạng thái:
        </span>
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded-lg border text-sm outline-none bg-white dark:bg-gray-800 dark:border-gray-600"
        >
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="cancelled">Đã huỷ</option>
        </select>
      </div>

      {/* ⚪ SẢN PHẨM */}
      <div className="space-y-2">
        <h4 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FiPackage /> Sản phẩm
        </h4>
        {order.items?.map((it, i) => (
          <div
            key={i}
            className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border shadow-sm"
          >
            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={it.cover_image || "/no-image.png"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {it.product_name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {it.size} - {it.color}
              </div>
              <div className="text-xs mt-1 flex justify-between">
                <span>x{it.quantity}</span>
                <span className="font-semibold">{money(it.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🔴 TỔNG KẾT TIỀN (Hiển thị Cọc & COD) */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-dashed border-gray-300 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tổng tiền hàng:</span>
          <span className="font-medium text-lg">{money(total)}</span>
        </div>

        <div className="flex justify-between text-sm text-green-600">
          <span>Đã đặt cọc:</span>
          <span className="font-medium">- {money(deposit)}</span>
        </div>

        <div className="border-t border-gray-300 my-2"></div>

        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
            <FiDollarSign className="text-red-500" /> CÒN LẠI (THU COD):
          </span>
          <span className="text-xl font-bold text-red-600">
            {money(remaining)}
          </span>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-4"></div>
    </motion.div>
  );
}
