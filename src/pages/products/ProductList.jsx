import { AnimatePresence, motion } from "framer-motion";
import {
  FiRefreshCw,
  FiSearch,
  FiPackage,
  FiTruck,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

const money = (v) =>
  (Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) || 0) +
  "đ";

export default function ProductList({
  list,
  filtered,
  brands,
  selected,
  setSelected,
  listLoading,
  search,
  setSearch,
  selectedBrand,
  setSelectedBrand,
  onRestock,
  reload,
}) {
  return (
    <>
      {/* --- HEADER --- */}
      <div className="flex flex-wrap items-center justify-between mb-5 gap-3">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <FiPackage className="text-green-600 dark:text-green-400" />
          </div>
          Danh sách sản phẩm
          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        </h3>
        <button
          onClick={reload}
          className="btn-outline flex items-center gap-1.5 text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <FiRefreshCw className={listLoading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl">
        <div className="relative flex-1 group">
          <FiSearch className="absolute top-3.5 left-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="🔍 Tìm theo tên hoặc SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative min-w-[180px]">
          <FiTag className="absolute top-3.5 left-3.5 text-gray-400 pointer-events-none z-10" />
          <select
            className="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {/* Custom Arrow for select */}
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* ------------------------------- */}
      {/* PC VERSION – TABLE */}
      {/* ------------------------------- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="overflow-auto max-h-[65vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold text-center w-20">
                  Ảnh
                </th>
                <th className="px-4 py-3 font-semibold text-left">
                  Thông tin sản phẩm
                </th>
                <th className="px-4 py-3 font-semibold text-center w-32">
                  Tồn kho
                </th>
                <th className="px-4 py-3 font-semibold text-right w-32">
                  Giá bán
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {listLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((p) => {
                    const isSelected = selected?.id === p.id;
                    const stockLow = Number(p.stock) <= 5;
                    const outOfStock = Number(p.stock) === 0;

                    return (
                      <motion.tr
                        key={p.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(p)}
                        className={`
                          group cursor-pointer transition-colors duration-200
                          ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }
                        `}
                      >
                        {/* Image Column */}
                        <td className="p-3 text-center">
                          <div className="relative inline-block">
                            {p.cover_image ? (
                              <img
                                src={p.cover_image}
                                alt={p.name}
                                className="w-12 h-12 object-cover rounded-lg shadow-sm bg-white border border-gray-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto text-gray-400">
                                <FiPackage />
                              </div>
                            )}
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-sm">
                                <FiCheckCircle size={10} />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Info Column */}
                        <td className="p-3">
                          <div className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 font-mono">
                              {p.sku}
                            </span>
                            {p.brand && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FiTag size={10} /> {p.brand}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Column */}
                        <td className="p-3 text-center">
                          {outOfStock ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestock(p);
                              }}
                              className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1 mx-auto w-fit"
                            >
                              <FiAlertCircle /> Hết hàng
                            </button>
                          ) : (
                            <div
                              className={`
                              inline-flex items-center gap-1 font-medium px-2.5 py-0.5 rounded-full text-xs
                              ${
                                stockLow
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                              }
                            `}
                            >
                              {p.stock} sẵn
                            </div>
                          )}
                        </td>

                        {/* Price Column */}
                        <td className="p-3 text-right">
                          <div className="font-bold text-gray-900 dark:text-gray-100">
                            {money(p.sale_price)}
                          </div>
                          {p.cost_price > 0 && (
                            <div className="text-[10px] text-gray-400">
                              Vốn: {money(p.cost_price)}
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FiSearch className="w-12 h-12 mb-2 opacity-50" />
                          <p>Không tìm thấy sản phẩm nào.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------- */}
      {/* MOBILE VERSION – CARD LIST */}
      {/* ------------------------------- */}
      <div className="md:hidden space-y-3 pb-24">
        {listLoading ? (
          <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300">
            <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Không có sản phẩm phù hợp.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelected(p)}
                className={`
                  relative flex gap-3 p-3 rounded-xl border shadow-sm
                  active:scale-[0.98] transition-transform
                  ${
                    selected?.id === p.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 ring-1 ring-blue-400"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                {/* Mobile Image */}
                <div className="flex-shrink-0">
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100"
                      alt=""
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                      <FiPackage size={24} />
                    </div>
                  )}
                </div>

                {/* Mobile Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate pr-2 text-sm leading-tight">
                      {p.name}
                    </h4>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm whitespace-nowrap">
                      {money(p.sale_price)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono border border-gray-200 dark:border-gray-600">
                      {p.sku}
                    </span>
                    {p.brand && <span className="truncate">• {p.brand}</span>}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    {Number(p.stock) > 0 ? (
                      <span
                        className={`
                        text-xs font-medium px-2 py-0.5 rounded-md
                        ${Number(p.stock) <= 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}
                      `}
                      >
                        Kho: {p.stock}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRestock(p);
                        }}
                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded border border-red-200 active:bg-red-100"
                      >
                        <FiTruck size={12} /> Nhập hàng
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
