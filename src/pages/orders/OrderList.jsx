import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiBox, FiCheckCircle } from "react-icons/fi";

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

export default function OrderList({
  filtered,
  loading,
  selected,
  setSelected,
}) {
  // 1. Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-sm">Đang tải danh sách...</span>
      </div>
    );
  }

  // 2. Empty
  if (!filtered || filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2 border border-dashed border-gray-300 rounded-xl m-2">
        <FiBox size={32} />
        <span className="text-sm">Không tìm thấy đơn hàng nào.</span>
      </div>
    );
  }

  return (
    // CONTAINER CHÍNH
    // Mobile: p-0, space-y-0 (Sát lề, dính liền nhau)
    // PC: p-2, space-y-3 (Có lề, có khoảng cách giữa các thẻ)
    <div className="overflow-y-auto max-h-[80vh] scrollbar-hide p-0 space-y-0 md:p-2 md:space-y-3">
      <AnimatePresence>
        {filtered.map((order) => {
          const firstItem = order.items && order.items[0];
          const imageSrc = firstItem?.cover_image || firstItem?.product_image;
          const depositAmount = Number(order.deposit || 0);

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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelected(order)}
              className={`
                group relative cursor-pointer transition-all duration-200

                /* === MOBILE STYLES (Giao diện phẳng, giống Facebook) === */
                w-full
                p-3
                bg-white dark:bg-gray-800
                rounded-none
                border-b border-gray-100 dark:border-gray-700  /* Chỉ gạch chân dưới */
                shadow-none

                /* === PC STYLES (Giao diện thẻ nổi) === */
                md:rounded-2xl
                md:border md:border-gray-100 md:dark:border-gray-700
                md:p-4
                md:shadow-sm md:hover:shadow-lg md:hover:border-blue-300

                ${
                  selected?.id === order.id
                    ? "bg-blue-50 dark:bg-blue-900/10 md:ring-2 md:ring-blue-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }
              `}
            >
              <div className="flex gap-3 md:gap-4">
                {/* --- 🖼️ ẢNH THUMBNAIL --- */}
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg md:rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shadow-inner relative">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="sp"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/100x100?text=No+Img")
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 text-[10px] bg-gray-100">
                      <FiBox size={20} />
                    </div>
                  )}

                  {/* Badge số lượng sản phẩm */}
                  {order.items?.length > 1 && (
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-bold backdrop-blur-sm">
                      +{order.items.length - 1}
                    </div>
                  )}
                </div>

                {/* --- 📝 THÔNG TIN CHÍNH --- */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          #{order.id}
                        </span>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm line-clamp-1">
                          {order.customer_name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {firstItem ? firstItem.product_name : "Đơn hàng trống"}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-blue-600 text-sm">
                        {money(order.total)}
                      </div>
                      {depositAmount > 0 ? (
                        <div className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md mt-1 inline-block border border-green-100">
                          Cọc: {money(depositAmount)}
                        </div>
                      ) : (
                        <div className="text-[10px] text-red-400 mt-1 italic">
                          Chưa cọc
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Tracking & Status */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                    {/* Mã vận đơn */}
                    <div className="flex items-center gap-2">
                      {order.china_tracking_code ? (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-[11px] bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                          <FiTruck size={10} />
                          <span className="font-mono font-medium">
                            ...{order.china_tracking_code.slice(-4)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">---</span>
                      )}
                    </div>

                    {/* Trạng thái */}
                    <span
                      className={`
                      px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
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
