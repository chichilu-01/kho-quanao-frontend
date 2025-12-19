import { FiPackage, FiSearch, FiRefreshCw, FiBox } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../hooks/useToastNotify";
import { useState, useRef, useEffect } from "react";

export default function OrderProductSelector({
  products,
  variants,
  selectedProductId,
  setSelectedProductId,
  loadVariants,
  items,
  setItems,
  loadingVariants = false, // Nên truyền thêm prop loading từ cha xuống
}) {
  const [search, setSearch] = useState("");
  const variantRef = useRef(null);

  // Auto scroll khi variants thay đổi và có sản phẩm được chọn
  useEffect(() => {
    if (selectedProductId && variants.length > 0 && variantRef.current) {
      // Scroll nhẹ nhàng tới khu vực biến thể
      variantRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedProductId, variants]);

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
    // Feedback nhỏ khi thêm thành công
    notify.success("Đã thêm vào đơn");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-6 flex flex-col lg:flex-row gap-6 h-full">
      {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
      <div className="flex-1">
        <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-gray-700">
          <FiPackage className="text-orange-500" /> Chọn Sản phẩm
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* GRID SẢN PHẨM */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-[500px] p-1">
          {filteredProducts.map((p) => {
            const isActive = Number(selectedProductId) === p.id;
            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (isActive) return; // Đang chọn rồi thì thôi
                  setSelectedProductId(p.id);
                  loadVariants(p.id);
                }}
                className={`cursor-pointer border rounded-xl p-2 bg-white shadow-sm transition relative flex flex-col ${
                  isActive
                    ? "border-blue-500 ring-2 ring-blue-100 bg-blue-50"
                    : "hover:border-gray-300"
                }`}
              >
                <img
                  src={p.cover_image || "/no-image.png"}
                  alt={p.name}
                  className="w-full h-32 object-cover rounded-lg mb-2 bg-gray-100"
                />
                <div className="font-medium text-sm line-clamp-2 min-h-[40px]">
                  {p.name}
                </div>
                <div className="mt-auto pt-2 flex justify-between items-end">
                  <span className="text-blue-600 font-bold text-sm">
                    {p.sale_price?.toLocaleString()}đ
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: BIẾN THỂ (VARIANTS) */}
      <div className="lg:w-1/3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 h-fit sticky top-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <FiBox /> Biến thể
          </h3>
          {selectedProductId && (
            <button
              onClick={() => loadVariants(selectedProductId)}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600"
            >
              <FiRefreshCw /> Làm mới
            </button>
          )}
        </div>

        <div ref={variantRef} className="space-y-2 min-h-[100px]">
          {!selectedProductId ? (
            <div className="text-center text-gray-400 py-10 text-sm">
              👈 Chọn một sản phẩm để xem biến thể
            </div>
          ) : loadingVariants ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : variants.length === 0 ? (
            <div className="text-center text-red-400 py-5 text-sm">
              Sản phẩm này chưa có biến thể nào.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {variants.map((v) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                >
                  <div>
                    <div className="font-semibold text-gray-800">
                      {v.size || "Free"} - {v.color || "Basic"}
                    </div>
                    <div
                      className={`text-xs ${v.stock > 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      Kho: {v.stock}
                    </div>
                  </div>

                  <button
                    disabled={v.stock <= 0}
                    onClick={() =>
                      addItem(
                        products.find((p) => p.id === v.product_id) || {},
                        v,
                      )
                    }
                    className={`px-3 py-1.5 rounded-md text-white text-xs font-bold shadow-sm transition-transform active:scale-95 ${
                      v.stock <= 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {v.stock <= 0 ? "Hết" : "+ Thêm"}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
