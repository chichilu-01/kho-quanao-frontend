import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiBox } from "react-icons/fi"; // Nhớ cài: npm i react-icons

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

export default function OrderList({
  filtered,
  loading,
  selected,
  setSelected,
}) {
  // 1. Xử lý khi đang tải
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-sm">Đang tải danh sách...</span>
      </div>
    );
  }

  // 2. Xử lý khi không có dữ liệu
  if (!filtered || filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 border border-dashed border-gray-300 rounded-xl m-2">
        <FiBox size={32} />
        <span className="text-sm">Không tìm thấy đơn hàng nào.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-1 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-gray-200">
      <AnimatePresence>
        {filtered.map((order) => {
          // Lấy ảnh sản phẩm đầu tiên để hiển thị
          const firstItem = order.items && order.items[0];
          const imageSrc = firstItem?.cover_image || firstItem?.product_image;

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setSelected(order)}
              className={`
                group relative p-3 rounded-xl cursor-pointer border transition-all duration-200 flex gap-3
                ${
                  selected?.id === order.id
                    ? "bg-blue-50 border-blue-500 shadow-sm dark:bg-blue-900/20 dark:border-blue-500"
                    : "bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                }
              `}
            >
              {/* --- ẢNH THUMBNAIL (QUAN TRỌNG ĐỂ NHẬN DIỆN) --- */}
              <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 relative">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="sp"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-1">
                    No Image
                  </div>
                )}
              </div>

              {/* --- THÔNG TIN CHÍNH --- */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                {/* Dòng 1: ID + Tên khách + Giá */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                      #{order.id} - {order.customer_name}
                    </span>
                    {/* Tên sản phẩm (cắt ngắn) */}
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                      {firstItem
                        ? `${firstItem.product_name} (${firstItem.size || ""})`
                        : "Chưa có sản phẩm"}
                      {order.items?.length > 1 &&
                        ` (+${order.items.length - 1})`}
                    </span>
                  </div>

                  {/* Giá tiền (Badge) */}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2
                    ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    {money(order.total)}
                  </span>
                </div>

                {/* --- Dòng 2: MÃ VẬN ĐƠN (CHÌA KHÓA CHO CTV) --- */}
                <div className="mt-2 flex items-center justify-between">
                  {order.china_tracking_code ? (
                    <div className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 text-[11px] font-bold px-2 py-1 rounded border border-yellow-200 shadow-sm">
                      <FiTruck className="text-yellow-700" />
                      <span className="font-mono tracking-wide">
                        ...{order.china_tracking_code.slice(-5)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-300 italic pl-1">
                      Chưa có vận đơn
                    </span>
                  )}

                  {/* Trạng thái text nhỏ */}
                  <span className="text-[10px] text-gray-400 capitalize">
                    {order.status === "pending"
                      ? "Chờ xử lý"
                      : order.status === "shipping"
                        ? "Đang giao"
                        : order.status === "confirmed"
                          ? "Đã xác nhận"
                          : order.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
