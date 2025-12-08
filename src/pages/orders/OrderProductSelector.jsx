import { FiPackage, FiSearch, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../hooks/useToastNotify";
import { useState } from "react";

export default function OrderProductSelector({
  products,
  variants,
  details = [], // ⭐ thêm
  selectedProductId,
  setSelectedProductId,
  loadVariants,
  loadDetails, // ⭐ thêm
  items,
  setItems,
}) {
  const [search, setSearch] = useState("");
  const [selectMode, setSelectMode] = useState("variant"); // ⭐ "variant" | "detail"

  // ===============================
  // Thêm sản phẩm vào giỏ
  // ===============================
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

  // =========================================
  // SEARCH FILTER
  // =========================================
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mt-6">
      <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-gray-700">
        <FiPackage className="text-orange-500" /> Sản phẩm
      </h3>

      {/* 🔍 Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên sản phẩm..."
          className="input pl-10 pr-3"
        />
      </div>

      {/* =============================== */}
      {/* GRID PRODUCT */}
      {/* =============================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
        {filteredProducts.map((p) => {
          const isActive = Number(selectedProductId) === p.id;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedProductId(p.id);
                loadVariants(p.id);
                loadDetails(p.id); // ⭐ load dạng detail
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

      {/* =============================== */}
      {/* 2 CHẾ ĐỘ CHỌN: VARIANT - DETAIL */}
      {/* =============================== */}
      {selectedProductId && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSelectMode("variant")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectMode === "variant"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Biến thể
          </button>

          <button
            onClick={() => setSelectMode("detail")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectMode === "detail"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Chi tiết
          </button>
        </div>
      )}

      {/* =============================== */}
      {/* REFRESH BUTTON */}
      {/* =============================== */}
      {selectedProductId && (
        <button
          onClick={() => {
            loadVariants(selectedProductId);
            loadDetails(selectedProductId);
          }}
          className="btn-outline flex items-center gap-1 mt-1 text-sm mb-3"
        >
          <FiRefreshCw /> Làm mới
        </button>
      )}

      {/* =============================== */}
      {/* MODE 1: VARIANTS */}
      {/* =============================== */}
      {selectMode === "variant" && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
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
                    addItem(
                      products.find((p) => p.id === v.product_id) || {},
                      v,
                    )
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
      )}

      {/* =============================== */}
      {/* MODE 2: DETAILS */}
      {/* =============================== */}
      {selectMode === "detail" && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
          <AnimatePresence>
            {details.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between p-3 border rounded-xl bg-white hover:shadow-sm transition"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {d.size || "-"} / {d.color || "-"}
                  </div>
                  <div className="text-xs text-gray-600">
                    Giá: <b>{Number(d.price || 0).toLocaleString()} đ</b>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tồn kho: <b>{d.stock}</b>
                  </div>
                </div>

                <button
                  disabled={d.stock <= 0}
                  onClick={() =>
                    addItem(products.find((p) => p.id === d.product_id) || {}, {
                      ...d,
                      sale_price: d.price,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-white text-sm ${
                    d.stock <= 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90"
                  }`}
                >
                  {d.stock <= 0 ? "Hết hàng" : "Thêm"}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
