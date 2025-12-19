import { AnimatePresence, motion } from "framer-motion";
import { FiPackage, FiTruck, FiAlertCircle } from "react-icons/fi";

const money = (v) => (Number(v || 0).toLocaleString("vi-VN") || 0) + "đ";

export default function ProductList({
  filtered, selected, setSelected,
  listLoading, onRestock, 
  viewType = "list", gridCols = 3 // Mặc định nhận props từ cha
}) {

  // --- 1. GIAO DIỆN LƯỚI (GRID CARD) ---
  const GridItem = ({ p }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => setSelected(p)}
      className={`
        relative flex flex-col bg-white dark:bg-gray-800 rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer
        ${selected?.id === p.id ? "border-blue-500 ring-2 ring-blue-500" : "border-gray-100 dark:border-gray-700"}
      `}
    >
      {/* Ảnh vuông */}
      <div className="aspect-square w-full bg-gray-100 dark:bg-gray-900 relative">
        <img 
          src={p.cover_image || "/no-image.png"} 
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = "/no-image.png"}
          alt={p.name}
        />
        {/* Badge Tồn kho */}
        <div className="absolute top-1 right-1">
           {Number(p.stock) === 0 ? (
             <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">HẾT</span>
           ) : Number(p.stock) <= 5 ? (
             <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">{p.stock}</span>
           ) : (
             <span className="bg-white/90 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-green-100">
               {p.stock}
             </span>
           )}
        </div>
      </div>

      {/* Thông tin */}
      <div className="p-2.5 flex flex-col flex-1">
        <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 h-8 leading-4 mb-1">
          {p.name}
        </h4>

        <div className="mt-auto flex items-end justify-between">
           <div>
             <div className="text-[10px] text-gray-400 font-mono">{p.sku}</div>
             <div className="font-bold text-sm text-blue-600 dark:text-blue-400">{money(p.sale_price)}</div>
           </div>

           {/* Nút nhập hàng nhanh (chỉ hiện khi sắp hết) */}
           {Number(p.stock) <= 5 && (
             <button 
                onClick={(e) => { e.stopPropagation(); onRestock(p); }}
                className="bg-red-50 text-red-600 p-1.5 rounded-lg active:bg-red-100 border border-red-100 hover:bg-red-100"
             >
                <FiTruck size={14}/>
             </button>
           )}
        </div>
      </div>
    </motion.div>
  );

  // --- 2. GIAO DIỆN DANH SÁCH (LIST ROW) ---
  const ListItem = ({ p }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelected(p)}
      className={`
        flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border shadow-sm mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors
        ${selected?.id === p.id ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-gray-100 dark:border-gray-700"}
      `}
    >
      {/* Ảnh nhỏ */}
      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative border border-gray-100 dark:border-gray-700">
        <img 
          src={p.cover_image || "/no-image.png"} 
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = "/no-image.png"}
          alt={p.name}
        />
        {Number(p.stock) === 0 && (
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">HẾT</span>
           </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
         <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">
              {p.name}
            </h4>
            <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
               <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded font-mono">{p.sku}</span>
               {p.brand && <span>• {p.brand}</span>}
            </div>
         </div>

         <div className="flex items-center justify-between mt-1">
            <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
               {money(p.sale_price)}
            </span>

            {Number(p.stock) > 0 ? (
               <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${Number(p.stock) <= 5 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                  Kho: {p.stock}
               </span>
            ) : (
               <button 
                  onClick={(e) => { e.stopPropagation(); onRestock(p); }}
                  className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-100 active:bg-red-100"
               >
                  <FiTruck size={12}/> Nhập
               </button>
            )}
         </div>
      </div>
    </motion.div>
  );

  // --- RENDER CHÍNH ---
  if (listLoading) return (
     <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Đang tải kho hàng...</span>
     </div>
  );

  if (filtered.length === 0) return (
     <div className="py-12 flex flex-col items-center justify-center text-gray-400 opacity-60">
        <FiPackage size={48} className="mb-2 stroke-1"/>
        <p>Không tìm thấy sản phẩm nào</p>
     </div>
  );

  return (
    <div className={viewType === 'grid' ? `grid gap-3 grid-cols-${gridCols}` : ''}>
      <AnimatePresence>
        {filtered.map(p => (
          viewType === 'grid' 
            ? <GridItem key={p.id} p={p} /> 
            : <ListItem key={p.id} p={p} />
        ))}
      </AnimatePresence>
    </div>
  );
}