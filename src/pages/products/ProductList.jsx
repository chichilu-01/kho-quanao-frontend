import { AnimatePresence, motion } from "framer-motion";
import { FiPackage, FiTruck, FiEdit3 } from "react-icons/fi";

// Link ảnh dự phòng online (fix lỗi 404 khi không tải được ảnh)
const FALLBACK_IMAGE = "https://placehold.co/400x400?text=No+Image";

const money = (v) => (Number(v || 0).toLocaleString("vi-VN") || 0) + "đ";

export default function ProductList({
  filtered,
  selected,
  setSelected,
  listLoading,
  onRestock,
  viewType = "grid",
  gridCols = 3,
}) {
  // Config số cột cho Grid View
  const gridClassMap = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-4 lg:grid-cols-5",
  };

  // --- 1. GIAO DIỆN LƯỚI (GRID) ---
  const GridItem = ({ p }) => {
    const isSelected = selected?.id === p.id;
    const stock = Number(p.stock);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelected(p)}
        className={`
          group relative flex flex-col bg-white dark:bg-gray-800 overflow-hidden cursor-pointer transition-all duration-300

          /* MOBILE: Vuông vức, viền mỏng */
          rounded-none border-b border-r border-gray-100 dark:border-gray-800

          /* PC (md trở lên): Bo góc, đổ bóng đẹp */
          md:rounded-2xl md:border md:shadow-sm md:hover:shadow-xl md:hover:border-blue-200

          ${isSelected ? "z-10 ring-2 ring-blue-500 md:border-blue-500" : ""}
        `}
      >
        {/* Ảnh vuông */}
        <div className="aspect-square w-full bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
          <img
            src={p.cover_image || FALLBACK_IMAGE}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => (e.target.src = FALLBACK_IMAGE)}
            alt={p.name}
          />

          {/* Badge Hết hàng */}
          <div className="absolute top-2 left-2">
            {stock === 0 ? (
              <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                HẾT
              </span>
            ) : stock <= 5 ? (
              <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                SL: {stock}
              </span>
            ) : null}
          </div>

          {/* Giá tiền */}
          <div className="absolute bottom-1 right-1 bg-white/90 dark:bg-gray-800/90 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
            {money(p.sale_price || p.price)}
          </div>
        </div>

        {/* Thông tin */}
        <div className="p-2 flex flex-col flex-1">
          <h4
            className="text-xs font-medium text-gray-700 dark:text-gray-100 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600"
            title={p.name}
          >
            {p.name}
          </h4>
          <div className="text-[10px] text-gray-400 font-mono mt-auto">
            #{p.id}
          </div>
        </div>
      </motion.div>
    );
  };

  // --- 2. GIAO DIỆN DANH SÁCH (LIST - FIX CHO MOBILE) ---
  const ListItem = ({ p }) => {
    const isSelected = selected?.id === p.id;
    const stock = Number(p.stock);

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setSelected(p)}
        className={`
          group flex gap-3 cursor-pointer transition-all duration-200

          /* === MOBILE STYLES (Phẳng, Full width) === */
          w-full
          p-3
          bg-white dark:bg-gray-900
          rounded-none 
          border-b border-gray-100 dark:border-gray-800  /* Chỉ gạch chân */
          mb-0 /* Không khoảng cách */

          /* === PC STYLES (Card nổi) === */
          md:rounded-xl 
          md:border md:border-gray-100 md:dark:border-gray-700
          md:mb-2 
          md:p-3
          md:shadow-sm md:hover:shadow-md md:hover:border-blue-300
          md:bg-white md:dark:bg-gray-800

          ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/10"
              : "hover:bg-gray-50 dark:hover:bg-gray-800"
          }
        `}
      >
        {/* Ảnh nhỏ bên trái */}
        <div className="w-[70px] h-[70px] flex-shrink-0 bg-gray-100 rounded md:rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 relative">
          <img
            src={p.cover_image || FALLBACK_IMAGE}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = FALLBACK_IMAGE)}
            alt={p.name}
          />
          {stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">HẾT</span>
            </div>
          )}
        </div>

        {/* Nội dung bên phải */}
        <div className="flex-1 flex flex-col justify-center min-w-0 py-0.5">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h4 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-blue-600">
                {p.name}
              </h4>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mã: <span className="font-mono">{p.sku || "---"}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[15px] font-bold text-blue-600">
                {money(p.sale_price || p.price)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Trạng thái kho */}
            <div className="flex items-center gap-2">
              {stock === 0 ? (
                <span className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  Hết hàng
                </span>
              ) : (
                <span
                  className={`text-[11px] font-medium ${stock <= 5 ? "text-orange-500" : "text-green-600"}`}
                >
                  Kho: {stock}
                </span>
              )}
            </div>

            {/* Nút nhập hàng nhanh (Chỉ hiện khi cần) */}
            {stock <= 5 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRestock(p);
                }}
                className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                + Nhập
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // --- RENDERING ---
  if (listLoading)
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs">Đang tải...</span>
      </div>
    );

  if (!filtered || filtered.length === 0)
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400">
        <FiPackage size={48} className="mb-2 opacity-50" />
        <p className="text-sm">Không có sản phẩm nào</p>
      </div>
    );

  return (
    <div
      className={
        viewType === "grid"
          ? `grid ${gridClassMap[gridCols] || "grid-cols-2 md:grid-cols-3"} gap-0 md:gap-4 bg-gray-200 dark:bg-gray-900 md:bg-transparent` // Grid Mobile: gap-0 để dính liền
          : "flex flex-col w-full"
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
