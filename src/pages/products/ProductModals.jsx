import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { api } from "../../api/client";

export function RestockModal({ open, setOpen, product, qty, setQty, reload }) {
  const close = () => setOpen(false);

  const confirmRestock = async () => {
    if (!qty || Number(qty) <= 0) {
      toast("⚠️ Nhập số lượng hợp lệ!");
      return;
    }
    try {
      await api("/stock/import", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          quantity: Number(qty),
        }),
      });

      toast.success(`📦 Đã nhập thêm ${qty} sp cho “${product.name}”`);
      close();
      await reload(product.id);
    } catch (err) {
      toast.error("❌ " + (err?.message || "Lỗi nhập hàng"));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                     bg-black/40 backdrop-blur-sm p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* MODAL CARD */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="
              w-full max-w-sm rounded-2xl p-5 
              bg-white dark:bg-gray-800 shadow-2xl space-y-4
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FiTruck className="text-blue-600" /> Nhập thêm hàng
              </h4>

              <button
                onClick={close}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-300">
              Sản phẩm: <b>{product?.name}</b>
            </p>

            {/* Input số lượng */}
            <input
              type="number"
              className="input dark:bg-gray-700 py-3 rounded-xl text-center text-lg font-semibold"
              placeholder="Nhập số lượng…"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={close}
                className="px-4 py-2 rounded-xl border border-gray-300 
                           dark:border-gray-600 dark:text-gray-200"
              >
                Hủy
              </button>

              <button
                onClick={confirmRestock}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 
                           text-white font-semibold shadow"
              >
                Xác nhận
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
