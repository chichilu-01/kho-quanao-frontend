import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiList,
  FiPlus,
  FiEdit3,
  FiGrid,
  FiSearch,
  FiChevronLeft,
  FiX,
} from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";
import MobileTabs from "../../components/common/MobileTabs";

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
  const [viewMode, setViewMode] = useState("list"); // Mobile Tabs
  const [listViewMode, setListViewMode] = useState("list"); // 'list' | 'grid'
  const [gridColumns, setGridColumns] = useState(3); // PC Grid Columns

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

  // Filter Logic
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

  const productTabs = [
    { value: "list", label: "Danh sách", icon: FiList },
    { value: "create", label: "Thêm mới", icon: FiPlus },
    { value: "edit", label: "Chi tiết", icon: FiEdit3, disabled: !selected },
  ];

  return (
    <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      {/* ======================= PC LAYOUT ======================= */}
      <div className="hidden md:flex flex-1 gap-6 p-6 overflow-hidden">
        {/* CỘT TRÁI */}
        <motion.div
          layout
          className="flex flex-col w-5/12 lg:w-4/12 gap-4 h-full"
        >
          {/* Header Toolbar */}
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

            {/* Search, Filter & View Switcher */}
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
              {/* Brand Select (PC) */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 px-2 py-2 rounded-lg text-sm font-medium outline-none border-none max-w-[100px] truncate cursor-pointer"
              >
                <option value="">Hãng</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

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

          {/* List Container */}
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

      {/* ======================= MOBILE LAYOUT ======================= */}
      <div className="md:hidden flex flex-col h-full overflow-hidden relative">
        {/* HEADER MOBILE (Fixed Top) */}
        {viewMode === "list" && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-3 shadow-sm z-20">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                📦 Kho ({list.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                  }
                  className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-blue-600 active:scale-90 transition-transform"
                >
                  {listViewMode === "grid" ? (
                    <FiList size={20} />
                  ) : (
                    <FiGrid size={20} />
                  )}
                </button>
                <button
                  onClick={() => setViewMode("create")}
                  className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-lg active:scale-90 transition-transform"
                >
                  <FiPlus size={20} />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tìm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-xl text-xs font-bold outline-none max-w-[80px] truncate"
              >
                <option value="">Hãng</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-3 pb-24 bg-gray-50 dark:bg-gray-900">
          {viewMode === "list" && (
            <ProductList
              filtered={filtered}
              selected={selected}
              setSelected={(p) => {
                setSelected(p);
                setViewMode("edit");
              }}
              listLoading={listLoading}
              onRestock={(p) => {
                setRestockProduct(p);
                setRestockQty("");
                setRestockModal(true);
              }}
              viewType={listViewMode}
              gridCols={2}
            />
          )}
        </div>

        {/* FULLSCREEN OVERLAYS (Mobile) */}
        <AnimatePresence>
          {viewMode === "create" && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col"
            >
              <div className="flex items-center gap-3 p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <FiChevronLeft />
                </button>
                <h3 className="font-bold text-lg">Thêm sản phẩm mới</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ProductForm load={load} />
              </div>
            </motion.div>
          )}

          {viewMode === "edit" && selected && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 bg-gray-100 rounded-full"
                  >
                    <FiChevronLeft />
                  </button>
                  <h3 className="font-bold text-lg max-w-[200px] truncate">
                    {selected.name}
                  </h3>
                </div>
                <button onClick={() => setViewMode("list")}>
                  <FiX size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ProductDetail
                  selected={selected}
                  setSelected={setSelected}
                  load={load}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="md:hidden">
          <MobileTabs
            options={productTabs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

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
