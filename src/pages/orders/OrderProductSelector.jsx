import { FiPackage, FiSearch, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../hooks/useToastNotify";
import { useState, useRef } from "react";

export default function OrderProductSelector({
  products,
  variants,
  selectedProductId,
  setSelectedProductId,
  loadVariants,
  items,
  setItems,
}) {
  const [search, setSearch] = useState("");

  // 📌 Ref dùng để scroll đến khu vực biến thể
  const variantRef = useRef(null);

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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-6">
      <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-gray-700">
        <FiPackage className="text-orange-500" /> Sản phẩm
      </h3>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="input pl-10 pr-3"
        />
      </div>

      {/* GRID SẢN PHẨM */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
        {filteredProducts.map((p) => {
          const isActive = Number(selectedProductId) === p.id;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={async () => {
                setSelectedProductId(p.id);

                // Load variants
                await loadVariants(p.id);

                // ⬇️ Auto scroll xuống khu vực biến thể
                setTimeout(() => {
                  if (variantRef.current) {
                    variantRef.current.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 250); // Delay 250ms để animation render xong
              }}
              className={`cursor-pointer border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition relative ${
                isActive ? "border-blue-500 ring-2 ring-blue-300" : ""
              }`}
            >
              <img
                src={p.cover_image}
                alt={p.name}
                className="w-full h-28 object-cover rounded-lg mb-2"
              />
              <div className="font-medium text-sm">{p.name}</div>
              {p.brand && (
                <div className="text-xs text-gray-500">{p.brand}</div>
              )}
              <div className="text-blue-600 font-bold mt-1">
                {p.sale_price?.toLocaleString()} đ
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* BUTTON LÀM MỚI */}
      {selectedProductId && (
        <button
          onClick={() => loadVariants(selectedProductId)}
          className="btn-outline flex items-center gap-1 mt-1 text-sm mb-3"
        >
          <FiRefreshCw /> Làm mới biến thể
        </button>
      )}

      {/* KHU VỰC BIẾN THỂ */}
      <div
        ref={variantRef}
        className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2"
      >
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
                  Tồn kho: <b>{v.stock}</b>
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
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
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
