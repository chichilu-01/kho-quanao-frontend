import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiX, FiAlertTriangle, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

/* ---------------------------------------------
   RESTOCK MODAL — Nhập Hàng
---------------------------------------------- */
export function RestockModal({ open, setOpen, product, qty, setQty, reload }) {
  const [loading, setLoading] = useState(false); // 🔥 Added loading state

  const close = () => {
    setOpen(false);
    setQty("");
  };

  const confirmRestock = async () => {
    if (!qty || Number(qty) <= 0)
      return toast.error("⚠️ Vui lòng nhập số lượng hợp lệ!");

    try {
      setLoading(true); // Start loading
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/stock/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: Number(qty),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Lỗi nhập hàng");

      toast.success(
        <span className="flex items-center gap-2">
          <FiCheck className="text-green-500" />
          <span>
            Đã nhập thêm <b>{qty}</b> sp cho <b>{product.name}</b>
          </span>
        </span>,
      );

      await reload(product.id);
      close();
    } catch (err) {
      console.error(err);
      toast.error("❌ " + (err.message || "Không thể nhập hàng"));
    } finally {
      setLoading(false); // Stop loading
    }
  };

  if (!open || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 border-b border-blue-100 dark:border-blue-800 flex justify-between items-center">
            <h4 className="font-bold text-lg text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <FiTruck className="text-xl" /> Nhập Kho Nhanh
            </h4>
            <button
              onClick={close}
              className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 transition"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-medium tracking-wide mb-1">
                Sản phẩm
              </p>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg line-clamp-2 leading-tight">
                {product.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                ID: #{product.id}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 text-center">
                Số lượng nhập thêm
              </label>
              <input
                type="number"
                autoFocus
                disabled={loading} // Disable input while loading
                className="w-full bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/50 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl py-3 text-center text-2xl font-bold text-blue-600 dark:text-blue-400 outline-none transition-colors placeholder-gray-300 disabled:opacity-50"
                placeholder="0"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && confirmRestock()}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={close}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmRestock}
                disabled={loading} // Disable button
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------------------------------------
   DELETE MODAL — Xóa Sản Phẩm
---------------------------------------------- */
export function DeleteModal({
  open,
  setOpen,
  selected,
  reload,
  clearSelected,
}) {
  const [loading, setLoading] = useState(false); // 🔥 Added loading state

  if (!open || !selected) return null;

  const confirmDelete = async () => {
    try {
      setLoading(true); // Start loading
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/products/${selected.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Lỗi khi xoá");

      toast.success("🗑️ Đã ẩn sản phẩm thành công");
      setOpen(false);
      clearSelected();
      await reload();
    } catch (err) {
      console.error(err);
      toast.error("❌ Không thể xoá sản phẩm");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !loading && setOpen(false)} // Prevent close if loading
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-sm rounded-3xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiAlertTriangle className="text-3xl text-red-600 dark:text-red-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Ẩn sản phẩm này?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed px-4">
                Bạn có chắc chắn muốn ẩn <b>"{selected.name}"</b> không? Hành
                động này sẽ đưa sản phẩm vào kho lưu trữ.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Không, giữ lại
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 dark:shadow-none active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Đang xử lý..." : "Đồng ý ẩn"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
