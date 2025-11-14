import { AnimatePresence, motion } from "framer-motion";
import { STATUS_STYLES } from "./StatusIcon";
import StatusIcon from "./StatusIcon";

function money(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

export default function OrderList({
  filtered,
  loading,
  selected,
  setSelected,
}) {
  return (
    <div className="overflow-auto max-h-[70vh] border border-gray-200 dark:border-gray-700 rounded-xl">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th className="text-right">Tổng tiền</th>
            <th className="text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Đang tải...
              </td>
            </tr>
          ) : (
            <AnimatePresence>
              {filtered.map((o) => (
                <motion.tr
                  key={o.id}
                  layout
                  onClick={() => setSelected(o)}
                  whileHover={{ scale: 1.02 }}
                  className={`cursor-pointer ${
                    selected?.id === o.id
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <td className="font-semibold text-blue-700 dark:text-blue-400">
                    #{o.id}
                  </td>
                  <td>{o.customer_name || "—"}</td>
                  <td className="text-right font-semibold text-green-700 dark:text-green-400">
                    {money(o.total)}
                  </td>
                  <td className="text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[o.status]}`}
                    >
                      <StatusIcon status={o.status} />
                      {{
                        pending: "Chờ xử lý",
                        confirmed: "Đã xác nhận",
                        shipping: "Đang giao",
                        completed: "Hoàn tất",
                        cancelled: "Đã huỷ",
                      }[o.status] || "Không xác định"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          )}
        </tbody>
      </table>
    </div>
  );
}
