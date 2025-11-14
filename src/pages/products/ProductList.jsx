import { AnimatePresence, motion } from "framer-motion";
import { FiRefreshCw, FiSearch, FiPackage, FiTruck } from "react-icons/fi";

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
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiPackage className="text-green-600" /> Danh sách sản phẩm
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => reload()}
            className="btn-outline flex items-center gap-1 text-sm"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            className="input pl-10 dark:bg-gray-800"
            placeholder="Tìm theo tên hoặc mã SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input dark:bg-gray-800"
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
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[70vh] rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th className="text-left">Tên</th>
              <th className="text-center">Tồn kho</th>
              <th className="text-right">Giá</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer ${
                      selected?.id === p.id
                        ? "bg-blue-50 dark:bg-blue-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <td className="p-2 text-center">
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          className="w-10 h-10 object-cover rounded-lg mx-auto"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-2 font-medium text-gray-800 dark:text-gray-100">
                      <div className="truncate">{p.name}</div>
                      <div className="text-xs text-gray-500">
                        {p.brand || "—"} • {p.sku}
                      </div>
                    </td>
                    <td className="text-center">
                      {Number(p.stock) > 0 ? (
                        <span className="text-green-600 font-semibold">
                          {p.stock}
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRestock(p);
                          }}
                          className="text-red-600 underline text-xs"
                        >
                          <FiTruck className="inline -mt-1" /> Nhập hàng
                        </button>
                      )}
                    </td>
                    <td className="text-right font-semibold text-green-700 dark:text-green-400">
                      {money(p.sale_price)}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      Không có sản phẩm phù hợp.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
