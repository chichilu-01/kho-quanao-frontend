import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiLayers,
  FiAlertCircle,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "../../hooks/useToastNotify";

// Helper format tiền
const money = (v) => Number(v || 0).toLocaleString("vi-VN") + "đ";

export default function OrderProductSelector({
  products,
  variants,
  selectedProductId,
  setSelectedProductId,
  loadVariants,
  items,
  setItems,
  loadingVariants = false,
}) {
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // 🔎 Logic tìm kiếm thông minh
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts(products);
    } else {
      const lower = search.toLowerCase();
      const result = products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          (p.sku && p.sku.toLowerCase().includes(lower)),
      );
      setFilteredProducts(result);
    }
  }, [search, products]);

  // 🛒 Logic thêm vào giỏ hàng (Giữ nguyên logic kiểm tra kho của bạn)
  const addItem = (product, v) => {
    // 1. Kiểm tra tồn kho
    if (v.stock <= 0) {
      notify.error(`Sản phẩm hết hàng!`);
      return;
    }

    // 2. Lấy giá bán (Ưu tiên giá sale)
    const price = Number(v.sale_price || product.sale_price || 0);

    setItems((prev) => {
      // Tìm xem sản phẩm đã có trong giỏ chưa
      const idx = prev.findIndex((it) => it.variant_id === v.id);

      if (idx >= 0) {
        // Đã có -> Tăng số lượng
        const clone = [...prev];
        const nextQty = clone[idx].quantity + 1;

        // Check tồn kho lần nữa
        if (nextQty > v.stock) {
          notify.info(`⚠️ Kho chỉ còn ${v.stock} sản phẩm`);
          return prev;
        }

        clone[idx].quantity = nextQty;
        return clone;
      } else {
        // Chưa có -> Thêm mới
        return [
          {
            product_id: product.id,
            product_name: product.name,
            product_image: product.cover_image, // Dùng cover_image theo data của bạn
            variant_id: v.id,
            size: v.size,
            color: v.color,
            quantity: 1,
            price,
            stock: v.stock,
          },
          ...prev, // Đẩy cái mới lên đầu danh sách
        ];
      }
    });

    // Feedback nhẹ khi thêm
    // notify.success("Đã thêm"); (Có thể tắt để đỡ spam thông báo)
  };

  // Kiểm tra xem biến thể đã có trong giỏ chưa (để hiện icon check)
  const isInCart = (variantId) => items.some((i) => i.variant_id === variantId);

  return (
    <div className="h-full flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 overflow-hidden">
      {/* 1. THANH TÌM KIẾM (Sticky Header) */}
      <div className="flex-shrink-0 bg-white p-3 border-b shadow-sm z-10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            className="w-full bg-gray-100 pl-10 pr-10 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all font-medium"
            placeholder="Tìm tên sản phẩm, mã SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* 2. LƯỚI SẢN PHẨM (GRID VIEW) */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <FiSearch size={24} className="mb-2 opacity-50" />
            <span className="text-sm">Không tìm thấy sản phẩm nào.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const isSelected = selectedProductId === product.id;
              // Giá hiển thị trên thẻ
              const displayPrice = product.sale_price || product.price;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    relative flex flex-col bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? "ring-2 ring-blue-500 border-transparent shadow-lg scale-[1.02] z-10"
                        : "border-gray-100 hover:border-blue-300 hover:shadow-md"
                    }
                  `}
                  onClick={() => {
                    if (!isSelected) {
                      setSelectedProductId(product.id);
                      loadVariants(product.id);
                    }
                  }}
                >
                  {/* Ảnh sản phẩm */}
                  <div className="aspect-square bg-gray-100 relative group">
                    {product.cover_image ? (
                      <img
                        src={product.cover_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <FiLayers size={24} />
                      </div>
                    )}

                    {/* Badge Giá */}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-blue-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      {money(displayPrice)}
                    </div>

                    {/* Overlay Click hint */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    )}
                  </div>

                  {/* Tên sản phẩm */}
                  <div className="p-2 border-b border-gray-50">
                    <h3
                      className="text-xs font-bold text-gray-700 line-clamp-1"
                      title={product.name}
                    >
                      {product.name}
                    </h3>
                  </div>

                  {/* --- KHU VỰC CHỌN BIẾN THỂ (Expandable) --- */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-blue-50/30"
                      >
                        <div className="p-2">
                          {loadingVariants ? (
                            <div className="flex justify-center py-2">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : variants.length === 0 ? (
                            <div className="text-[10px] text-red-500 text-center py-1 flex items-center justify-center gap-1">
                              <FiAlertCircle /> Hết hàng / Lỗi
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5">
                              {variants.map((v) => {
                                const active = isInCart(v.id);
                                const outOfStock = v.stock <= 0;

                                return (
                                  <button
                                    key={v.id}
                                    disabled={outOfStock}
                                    onClick={(e) => {
                                      e.stopPropagation(); // Chặn click lan ra thẻ cha
                                      addItem(product, v);
                                    }}
                                    className={`
                                      relative text-[10px] py-1.5 px-1 rounded border text-center font-medium transition-all
                                      ${
                                        outOfStock
                                          ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed decoration-slice"
                                          : active
                                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                                      }
                                    `}
                                  >
                                    <span
                                      className={
                                        outOfStock ? "line-through" : ""
                                      }
                                    >
                                      {v.size || "F"} / {v.color || "Basic"}
                                    </span>

                                    {/* Icon check góc */}
                                    {active && !outOfStock && (
                                      <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-[1px] shadow-sm z-10">
                                        <FiCheck size={8} />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
