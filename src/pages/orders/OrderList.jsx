import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiBox, FiCheckCircle } from "react-icons/fi"; // Đã thêm icon Check

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

  // ... (imports giữ nguyên)

  return (
    <div className="space-y-3 p-2 overflow-y-auto max-h-[80vh] scrollbar-hide">
      <AnimatePresence>
        {filtered.map((order) => {
          const firstItem = order.items && order.items[0];
          const imageSrc = firstItem?.cover_image || firstItem?.product_image;
          const depositAmount = Number(order.deposit || 0);

          // Định nghĩa màu sắc cho từng trạng thái
          const statusStyles = {
            pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
            confirmed: "bg-blue-50 text-blue-700 border-blue-200",
            shipping: "bg-purple-50 text-purple-700 border-purple-200",
            completed: "bg-green-50 text-green-700 border-green-200",
            cancelled: "bg-red-50 text-red-700 border-red-200",
          };

          const statusLabel = {
            pending: "Chờ xử lý",
            confirmed: "Đã xác nhận",
            shipping: "Đang giao",
            completed: "Hoàn tất",
            cancelled: "Đã hủy",
          };

          return (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01 }} // ✨ Hiệu ứng nổi nhẹ khi di chuột
              onClick={() => setSelected(order)}
              className={`
              group relative p-4 rounded-2xl cursor-pointer border transition-all duration-300
              ${
                selected?.id === order.id
                  ? "bg-white border-blue-500 shadow-md ring-4 ring-blue-500/10" // Selected: Có viền xanh + Ring mờ
                  : "bg-white border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-300" // Normal
              }
            `}
            >
              <div className="flex gap-4">
                {/* --- 🖼️ ẢNH THUMBNAIL (Bo góc lớn hơn, Shadow nhẹ) --- */}
                <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="sp"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 text-[10px] bg-gray-100">
                      <FiBox size={20} />
                      <span>No IMG</span>
                    </div>
                  )}

                  {/* Số lượng sản phẩm thêm (Badge nhỏ ở góc ảnh) */}
                  {order.items?.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold backdrop-blur-sm">
                      +{order.items.length - 1}
                    </div>
                  )}
                </div>

                {/* --- 📝 THÔNG TIN CHÍNH --- */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  {/* Dòng 1: Tên khách & ID */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded text-mono">
                          #{order.id}
                        </span>
                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                          {order.customer_name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {firstItem
                          ? firstItem.product_name
                          : "Đơn chưa có hàng"}
                      </p>
                    </div>

                    {/* Giá tiền nổi bật */}
                    <div className="text-right">
                      <div className="font-bold text-blue-600 text-sm">
                        {money(order.total)}
                      </div>
                      {/* Hiển thị cọc đẹp hơn */}
                      {depositAmount > 0 ? (
                        <div className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md mt-1 inline-block border border-green-100">
                          Đã cọc: {money(depositAmount)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-red-400 mt-1 italic">
                          Chưa cọc
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dòng 2: Footer (Tracking & Status) */}
                  <div className="flex items-end justify-between mt-3 pt-2 border-t border-gray-50">
                    {/* Tracking Code Badge */}
                    {order.china_tracking_code ? (
                      <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2 py-1 rounded-lg border border-gray-200 text-[11px] hover:bg-white hover:border-blue-300 transition-colors">
                        <FiTruck size={12} />
                        <span className="font-mono font-medium tracking-wide">
                          {order.china_tracking_code.slice(-6)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">
                        --
                      </span>
                    )}

                    {/* Status Badge xịn xò */}
                    <span
                      className={`
                    px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm
                    ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}
                  `}
                    >
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
