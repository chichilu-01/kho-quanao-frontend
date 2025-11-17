import { motion, AnimatePresence } from "framer-motion";
import { FiTruck, FiTrash2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { api } from "../../api/client";

/* ---------------------------------------------
   RESTOCK MODAL — phiên bản PRO
---------------------------------------------- */
export function RestockModal({ open, setOpen, product, qty, setQty, reload }) {
  const close = () => setOpen(false);

  const confirmRestock = async () => {
    if (!qty || Number(qty) <= 0) return toast("⚠️ Nhập số lượng hợp lệ!");

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

  if (!open || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center
                   bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22 }}
          className="w-full max-w-sm rounded-3xl p-6 
                     bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
                     shadow-2xl border border-gray-200/40 dark:border-gray-700/40
                     space-y-4"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <FiTruck className="text-blue-600" /> Nhập thêm hàng
            </h4>

            <button
              onClick={close}
              className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700/50"
            >
              <FiX size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            Sản phẩm: <b>{product.name}</b>
          </p>

          {/* INPUT */}
          <input
            type="number"
            className="input dark:bg-gray-700 py-3 rounded-2xl text-center 
                       text-lg font-semibold"
            placeholder="Nhập số lượng…"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={close}
              className="px-5 py-2.5 rounded-xl border border-gray-300 
                         dark:border-gray-600 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>

            <button
              onClick={confirmRestock}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 
                         text-white font-semibold shadow-lg shadow-blue-500/20
                         active:scale-95 transition"
            >
              Xác nhận
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------------------------------------------
   DELETE MODAL — phiên bản PRO
---------------------------------------------- */
export function DeleteModal({
  open,
  setOpen,
  selected,
  reload,
  clearSelected,
}) {
  if (!open || !selected) return null;

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/products/${selected.id}`,
        { method: "DELETE" },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message);

      toast.success("🗑️ Đã ẩn sản phẩm");
      setOpen(false);
      clearSelected();
      await reload();
    } catch (err) {
      toast.error("❌ Không thể xoá");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center
                   bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 22 }}
          className="w-full max-w-sm rounded-3xl p-6 
                     bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
                     shadow-2xl border border-gray-200/40 dark:border-gray-700/40
                     space-y-4"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-lg text-red-600 flex items-center gap-2">
              <FiTrash2 /> Ẩn sản phẩm
            </h4>

            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700/50"
            >
              <FiX size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Bạn có chắc muốn ẩn sản phẩm <b>{selected.name}</b>?
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-300 
                         dark:border-gray-600 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Hủy
            </button>

            <button
              onClick={confirmDelete}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 
                         text-white font-semibold shadow-lg shadow-red-500/20
                         active:scale-95 transition"
            >
              Xác nhận
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
