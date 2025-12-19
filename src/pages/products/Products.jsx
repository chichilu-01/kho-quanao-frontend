import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiList,
  FiPlus,
  FiEdit3,
  FiGrid,
  FiSearch,
  FiFilter,
  FiX,
} from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";

export default function Products() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Modals
  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [listLoading, setListLoading] = useState(false);

  // View States
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'create' | 'edit'
  const [listViewMode, setListViewMode] = useState("list"); // 'list' | 'grid'
  const [gridColumns, setGridColumns] = useState(3);

  // Load Data
  const load = async (selectId, q = "") => {
    try {
      setListLoading(true);
      const data = await api(
        `/products${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      const arr = Array.isArray(data) ? data : [];
      setList(arr);

      if (selectId) {
        const found = arr.find((x) => x.id === selectId);
        setSelected(found || null);
      } else if (!selected && arr?.length && window.innerWidth >= 768) {
        setSelected(arr[0]);
      }
    } catch (err) {
      toast.error("❌ Lỗi tải danh sách");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter
  const brands = useMemo(
    () => [...new Set(list.map((p) => p.brand).filter(Boolean))],
    [list],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q);
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      return matchSearch && matchBrand;
    });
  }, [list, search, selectedBrand]);

  // Helper chuyển tab mobile
  const switchTab = (mode) => {
    if (mode === "edit" && !selected) {
      toast("⚠️ Chọn sản phẩm để xem chi tiết");
      return;
    }
    setViewMode(mode);
  };

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      {/* ======================= PC LAYOUT (Giữ nguyên) ======================= */}
      <div className="hidden md:flex flex-1 gap-6 p-6 overflow-hidden h-full">
        {/* CỘT TRÁI */}
        <motion.div
          layout
          className="flex flex-col w-5/12 lg:w-4/12 gap-4 h-full"
        >
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3 flex-shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                📦 Kho{" "}
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {list.length}
                </span>
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <FiPlus /> Mới
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  className="w-full pl-9 pr-2 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 flex-shrink-0">
                <button
                  onClick={() => setListViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${listViewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-400"}`}
                >
                  <FiList size={18} />
                </button>
                <button
                  onClick={() => setListViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${listViewMode === "grid" ? "bg-white shadow text-blue-600" : "text-gray-400"}`}
                >
                  <FiGrid size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto pr-1 custom-scrollbar p-3">
              <ProductList
                filtered={filtered}
                selected={selected}
                setSelected={setSelected}
                listLoading={listLoading}
                onRestock={(p) => {
                  setRestockProduct(p);
                  setRestockQty("");
                  setRestockModal(true);
                }}
                viewType={listViewMode}
                gridCols={listViewMode === "grid" ? 2 : 1}
              />
            </div>
          </div>
        </motion.div>
        {/* CỘT PHẢI */}
        <motion.div
          layout
          className="flex-1 h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 overflow-hidden relative"
        >
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
            {selected ? (
              <ProductDetail
                selected={selected}
                setSelected={setSelected}
                load={load}
              />
            ) : (
              <ProductForm load={load} />
            )}
          </div>
        </motion.div>
      </div>

      {/* ======================= MOBILE LAYOUT (CONTROL CENTER) ======================= */}
      <div className="md:hidden flex flex-col h-full relative">
        {/* 🔥 HEADER & NAV COMBINED 🔥 */}
        <div className="bg-white dark:bg-gray-900 shadow-sm z-30 border-b border-gray-200 dark:border-gray-800">
          {/* Dòng 1: Tab Điều Hướng (Segmented Control) */}
          <div className="p-2">
            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button
                onClick={() => switchTab("list")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <FiList /> Danh sách
              </button>
              <button
                onClick={() => switchTab("create")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === "create" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500"}`}
              >
                <FiPlus /> Thêm mới
              </button>
              <button
                onClick={() => switchTab("edit")}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${viewMode === "edit" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400"}`}
              >
                <FiEdit3 /> Chi tiết
              </button>
            </div>
          </div>

          {/* Dòng 2: Toolbar (Chỉ hiện khi ở tab Danh sách) */}
          {viewMode === "list" && (
            <div className="px-3 pb-3 flex gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Brand Filter (Mini) */}
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="appearance-none h-full bg-gray-100 dark:bg-gray-800 pl-3 pr-8 rounded-xl text-xs font-bold outline-none border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả hãng</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <FiFilter
                  className="absolute right-2 top-3 text-gray-400 pointer-events-none"
                  size={12}
                />
              </div>

              {/* Toggle Grid/List */}
              <button
                onClick={() =>
                  setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                }
                className="w-10 h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl text-blue-600 dark:text-blue-400 active:scale-90 transition-transform"
              >
                {listViewMode === "grid" ? (
                  <FiList size={18} />
                ) : (
                  <FiGrid size={18} />
                )}
              </button>
            </div>
          )}
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3">
          <AnimatePresence mode="wait">
            {/* LIST VIEW */}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-20" // Padding bottom dự phòng
              >
                <div className="mb-2 flex justify-between items-center text-xs text-gray-500 px-1">
                  <span>
                    Tìm thấy: <b>{filtered.length}</b> sản phẩm
                  </span>
                </div>
                <ProductList
                  filtered={filtered}
                  selected={selected}
                  setSelected={(p) => {
                    setSelected(p);
                    setViewMode("edit");
                  }} // Tự nhảy sang tab chi tiết khi chọn
                  listLoading={listLoading}
                  onRestock={(p) => {
                    setRestockProduct(p);
                    setRestockQty("");
                    setRestockModal(true);
                  }}
                  viewType={listViewMode}
                  gridCols={2}
                />
              </motion.div>
            )}

            {/* CREATE VIEW */}
            {viewMode === "create" && (
              <motion.div
                key="create"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[500px]">
                  <ProductForm load={load} />
                </div>
              </motion.div>
            )}

            {/* DETAIL VIEW */}
            {viewMode === "edit" && (
              <motion.div
                key="edit"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[500px]">
                  {selected ? (
                    <ProductDetail
                      selected={selected}
                      setSelected={setSelected}
                      load={load}
                    />
                  ) : (
                    <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                      <FiEdit3 size={40} className="mb-2 opacity-50" />
                      <p>Chưa chọn sản phẩm nào</p>
                      <button
                        onClick={() => setViewMode("list")}
                        className="mt-4 text-blue-600 font-medium"
                      >
                        Quay lại danh sách
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MODALS */}
      <RestockModal
        open={restockModal}
        setOpen={setRestockModal}
        product={restockProduct}
        qty={restockQty}
        setQty={setRestockQty}
        reload={load}
      />
      <DeleteModal
        open={deleteModal}
        setOpen={setDeleteModal}
        selected={selected}
        reload={load}
        clearSelected={() => setSelected(null)}
      />
    </div>
  );
}
