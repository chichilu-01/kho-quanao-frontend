import { AnimatePresence, motion } from "framer-motion";
import { FiPackage, FiTruck, FiEdit3 } from "react-icons/fi";

const money = (v) => (Number(v || 0).toLocaleString("vi-VN") || 0) + "đ";

export default function ProductList({
  filtered,
  selected,
  setSelected,
  listLoading,
  onRestock,
  viewType = "grid", // Mặc định là grid cho đẹp
  gridCols = 3,
}) {
  // 🛠️ FIX LỖI TAILWIND: Map số cột ra class cụ thể
  const gridClassMap = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3", // Mobile 2 cột, PC 3 cột
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
  };

  // --- 1. GIAO DIỆN LƯỚI (GRID CARD - PRO) ---
  const GridItem = ({ p }) => {
    const isSelected = selected?.id === p.id;
    const stock = Number(p.stock);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelected(p)}
        className={`
          group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300
          ${
            isSelected
              ? "border-blue-500 ring-2 ring-blue-500 shadow-lg z-10"
              : "border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-blue-200"
          }
        `}
      >
        {/* Ảnh vuông */}
        <div className="aspect-square w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
          <img
            src={p.cover_image || "/no-image.png"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => (e.target.src = "/no-image.png")}
            alt={p.name}
          />

          {/* Overlay Edit khi Hover (Chỉ hiện trên PC) */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white text-gray-800 p-2 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
              <FiEdit3 size={18} />
            </div>
          </div>

          {/* Badge Tồn kho (Góc trái trên) */}
          <div className="absolute top-2 left-2">
            {stock === 0 ? (
              <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm tracking-wide">
                HẾT HÀNG
              </span>
            ) : stock <= 5 ? (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                <FiTruck size={10} /> Còn {stock}
              </span>
            ) : null}
          </div>

          {/* Giá tiền (Góc phải dưới - Nổi bật trên ảnh) */}
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur dark:bg-gray-800/90 text-blue-700 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-white/50">
            {money(p.sale_price || p.price)}
          </div>
        </div>

        {/* Thông tin */}
        <div className="p-3 flex flex-col flex-1">
          <div className="text-[10px] text-gray-400 font-mono mb-1 flex justify-between">
            <span>{p.sku || `#${p.id}`}</span>
            {stock > 5 && (
              <span className="text-green-600 font-bold">Kho: {stock}</span>
            )}
          </div>

          <h4
            className="text-sm font-bold text-gray-700 dark:text-gray-100 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors"
            title={p.name}
          >
            {p.name}
          </h4>
        </div>
      </motion.div>
    );
  };

  // --- 2. GIAO DIỆN DANH SÁCH (LIST ROW - CLEAN) ---
  const ListItem = ({ p }) => {
    const isSelected = selected?.id === p.id;
    const stock = Number(p.stock);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setSelected(p)}
        className={`
          group flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border mb-2 cursor-pointer transition-all duration-200
          ${
            isSelected
              ? "border-blue-500 bg-blue-50/50 shadow-md"
              : "border-gray-100 hover:border-blue-300 hover:shadow-md dark:border-gray-700"
          }
        `}
      >
        {/* Ảnh nhỏ */}
        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative">
          <img
            src={p.cover_image || "/no-image.png"}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = "/no-image.png")}
            alt={p.name}
          />
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold uppercase">
                Hết
              </span>
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {p.name}
              </h4>
              <div className="text-xs text-gray-400 font-mono mt-0.5">
                {p.sku}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-blue-600">
                {money(p.sale_price || p.price)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-700">
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {stock === 0 ? (
                <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">
                  Hết hàng
                </span>
              ) : stock <= 5 ? (
                <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                  Sắp hết: {stock}
                </span>
              ) : (
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                  Sẵn sàng: {stock}
                </span>
              )}
            </div>

            {/* Action Button (Chỉ hiện khi cần nhập) */}
            {stock <= 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestock(p);
                }}
                className="text-[10px] font-bold text-red-600 flex items-center gap-1 hover:underline"
              >
                <FiTruck /> Nhập hàng
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDER CHÍNH ---
  if (listLoading)
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-sm font-medium animate-pulse">
          Đang tải kho hàng...
        </span>
      </div>
    );

  if (!filtered || filtered.length === 0)
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-300">
        <FiPackage size={64} className="mb-4 stroke-1 opacity-50" />
        <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào</p>
        <p className="text-xs text-gray-400 mt-1">
          Thử tìm kiếm từ khóa khác xem sao?
        </p>
      </div>
    );

  return (
    <div
      className={
        viewType === "grid"
          ? `grid gap-4 ${gridClassMap[gridCols] || "grid-cols-2 md:grid-cols-3"}`
          : "flex flex-col gap-2"
      }
    >
      <AnimatePresence mode="popLayout">
        {filtered.map((p) =>
          viewType === "grid" ? (
            <GridItem key={p.id} p={p} />
          ) : (
            <ListItem key={p.id} p={p} />
          ),
        )}
      </AnimatePresence>
    </div>
  );
}
