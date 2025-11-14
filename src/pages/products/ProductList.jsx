import { AnimatePresence, motion } from "framer-motion";
import {
  FiRefreshCw,
  FiSearch,
  FiPackage,
  FiTruck,
  FiTag,
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
          <FiPackage className="text-green-600" /> Danh sách sản phẩm
        </h3>
        <button
          onClick={reload}
          className="btn-outline flex items-center gap-1 text-sm"
        >
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            className="input pl-10 dark:bg-gray-800"
            placeholder="Tìm theo tên hoặc SKU…"
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

      {/* ------------------------------- */}
      {/* PC VERSION – TABLE */}
      {/* ------------------------------- */}
      <div className="overflow-auto max-h-[70vh] rounded-xl border border-gray-200 dark:border-gray-700 hidden md:block">
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
                    <td className="p-2 font-medium">
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

      {/* ------------------------------- */}
      {/* MOBILE VERSION – CARD LIST */}
      {/* ------------------------------- */}

      <div className="md:hidden space-y-3">
        {listLoading ? (
          <div className="text-center text-gray-500 py-6">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            Không có sản phẩm phù hợp.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((p) => (
              <motion.div
                key={p.id}
                layout
                onClick={() => setSelected(p)}
                className={`
                  flex gap-3 items-center p-3 rounded-xl border
                  cursor-pointer active:scale-[0.99]
                  ${
                    selected?.id === p.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                {/* Image */}
                <div>
                  {p.cover_image ? (
                    <img
                      src={p.cover_image}
                      className="w-14 h-14 rounded-lg object-cover shadow"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {p.name}
                  </div>

                  <div className="text-xs text-gray-500">
                    {p.brand || "—"} • {p.sku}
                  </div>

                  {/* Stock status */}
                  {p.stock > 0 ? (
                    <span className="inline-block mt-1 px-2 py-[2px] text-xs rounded-lg bg-green-100 text-green-700 font-medium">
                      Tồn: {p.stock}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestock(p);
                      }}
                      className="inline-flex items-center gap-1 mt-1 text-xs text-red-600 underline"
                    >
                      <FiTruck className="text-xs" /> Nhập hàng
                    </button>
                  )}
                </div>

                {/* Price */}
                <div className="text-right">
                  <div className="font-bold text-green-600 dark:text-green-400">
                    {money(p.sale_price)}
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
