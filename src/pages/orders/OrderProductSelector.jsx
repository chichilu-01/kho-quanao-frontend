// src/pages/orders/OrderProductSelector.jsx
import { FiPackage, FiSearch, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../hooks/useToastNotify";

export default function OrderProductSelector({
  products,
  variants,
  selectedProductId,
  setSelectedProductId,
  loadVariants,
  items,
  setItems,
}) {
  const addItem = (product, v) => {
    if (v.stock <= 0) {
      notify.error(`Biến thể ${v.size || "-"} / ${v.color || "-"} hết hàng`);
      return;
    }
    const price = Number(v.sale_price || product.sale_price || 0);

    setItems((prev) => {
      const idx = prev.findIndex((it) => it.variant_id === v.id);
      if (idx >= 0) {
        const clone = [...prev];
        const nextQty = clone[idx].quantity + 1;
        if (nextQty > v.stock) {
          notify.info(`⚠️ Chỉ còn ${v.stock} sản phẩm tồn kho`);
          return prev;
        }
        clone[idx].quantity = nextQty;
        return clone;
      } else {
        return [
          ...prev,
          {
            product_id: product.id,
            product_name: product.name,
            product_image: product.cover_image,
            variant_id: v.id,
            size: v.size,
            color: v.color,
            quantity: 1,
            price,
            stock: v.stock,
          },
        ];
      }
    });
  };

  return (
    <div className="mt-6">
      <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-gray-700">
        <FiPackage className="text-orange-500" /> Sản phẩm
      </h3>

      <div className="relative">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <select
          className="input pl-9"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} {p.brand ? `(${p.brand})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <button
          onClick={() => loadVariants(selectedProductId)}
          className="btn-outline flex items-center gap-1 mt-2 text-sm"
        >
          <FiRefreshCw /> Làm mới biến thể
        </button>
      )}

      <div className="mt-3 grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
        <AnimatePresence>
          {variants.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-between p-3 border rounded-xl bg-white hover:shadow-sm transition"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {v.size || "-"} / {v.color || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Tồn: <b>{v.stock}</b>
                </div>
              </div>
              <button
                disabled={v.stock <= 0}
                onClick={() =>
                  addItem(products.find((p) => p.id === v.product_id) || {}, v)
                }
                className={`px-3 py-1 rounded-lg text-white text-sm ${
                  v.stock <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {v.stock <= 0 ? "Hết hàng" : "Thêm"}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
