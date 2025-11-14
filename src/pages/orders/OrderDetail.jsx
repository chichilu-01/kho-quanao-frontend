import { motion } from "framer-motion";
import StatusIcon from "./StatusIcon";

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

export default function OrderDetail({ selected, updateStatus, updating }) {
  if (!selected)
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Chọn một đơn hàng để xem chi tiết.
      </div>
    );

  return (
    <motion.div
      key={selected.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 p-3 rounded-xl">
        <div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            #{selected.id}
          </div>
          <div className="text-sm text-gray-500">{selected.customer_name}</div>
        </div>
        <StatusIcon status={selected.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 text-sm mt-3">
        <div className="text-gray-500">Ngày tạo</div>
        <div>{new Date(selected.created_at).toLocaleString("vi-VN")}</div>
        <div className="text-gray-500">Trạng thái</div>
        <div>
          <select
            value={selected.status || "pending"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn tất</option>
            <option value="cancelled">Đã huỷ</option>
          </select>
        </div>
      </div>

      <hr className="my-3" />
      <h4 className="font-medium">🛍️ Sản phẩm trong đơn</h4>

      {Array.isArray(selected.items) && selected.items.length > 0 ? (
        selected.items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 border rounded-xl p-2 bg-gray-50 dark:bg-gray-800/50"
          >
            {it.cover_image ? (
              <img
                src={it.cover_image}
                className="w-14 h-14 object-cover rounded-lg"
              />
            ) : (
              <div className="w-14 h-14 flex items-center justify-center border rounded-lg text-gray-400">
                —
              </div>
            )}
            <div className="flex-1 text-sm">
              <div className="font-medium">{it.product_name}</div>
              <div className="text-gray-500">
                SL: {it.quantity} × {money(it.price)}
              </div>
            </div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              {money(it.quantity * it.price)}
            </div>
          </motion.div>
        ))
      ) : (
        <div className="text-gray-500 text-sm">
          Không có sản phẩm trong đơn này.
        </div>
      )}

      <hr className="my-3" />
      <div className="text-right text-lg font-bold">
        Tổng cộng:{" "}
        <span className="text-green-600 dark:text-green-400">
          {money(selected.total)}
        </span>
      </div>
    </motion.div>
  );
}
