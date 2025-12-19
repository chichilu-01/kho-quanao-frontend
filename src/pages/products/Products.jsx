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
  const [viewMode, setViewMode] = useState("list"); // Mobile Tabs state
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
    // CONTAINER CHÍNH: Dùng h-screen và overflow-hidden để khóa cuộn trang web, chỉ cuộn nội dung con
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

      {/* ============================================================ */}
      {/* PC LAYOUT (Giữ nguyên, chỉ ẩn trên mobile) */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-1 gap-6 p-6 overflow-hidden h-full">
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
            {/* Search */}
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
          {/* List */}
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

      {/* ============================================================ */}
      {/* MOBILE LAYOUT (Cấu trúc Flexbox dọc - Fix lỗi đè tuyệt đối) */}
      {/* ============================================================ */}
      <div className="md:hidden flex flex-col h-full relative">
        {/* 1. HEADER CỐ ĐỊNH (Flex Item - Không dùng sticky để tránh lỗi z-index) */}
        {viewMode === "list" && (
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-30 relative shadow-sm">
            <div className="px-4 py-3 space-y-3">
              {/* Row 1: Title & Buttons */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate pr-2">
                  📦 Kho ({list.length})
                </h2>
                <div className="flex gap-2 flex-shrink-0">
                  {/* Nút chuyển Grid/List */}
                  <button
                    onClick={() =>
                      setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                    }
                    className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-blue-600 dark:text-blue-400 active:scale-95 transition-transform border border-gray-200 dark:border-gray-700"
                  >
                    {listViewMode === "grid" ? (
                      <FiList size={20} />
                    ) : (
                      <FiGrid size={20} />
                    )}
                  </button>
                  {/* Nút tạo mới */}
                  <button
                    onClick={() => setViewMode("create")}
                    className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-md active:scale-95 transition-transform"
                  >
                    <FiPlus size={22} />
                  </button>
                </div>
              </div>

              {/* Row 2: Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                  <input
                    className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 border border-transparent focus:border-blue-500 transition-all"
                    placeholder="Tìm tên, SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-500 max-w-[90px] truncate"
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
          </div>
        )}

        {/* 2. BODY CUỘN ĐỘC LẬP (Flex Grow) */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 relative w-full">
          <div className="p-3 pb-24">
            {" "}
            {/* Padding bottom để tránh bị Tab Bar che */}
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
        </div>

        {/* 3. FULLSCREEN OVERLAYS (Create/Edit - Phủ kín màn hình với z-index cao nhất) */}
        <AnimatePresence>
          {viewMode === "create" && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col"
            >
              <div className="flex-shrink-0 flex items-center gap-3 p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <FiChevronLeft />
                </button>
                <h3 className="font-bold text-lg">Thêm sản phẩm</h3>
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
              className="absolute inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col"
            >
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    <FiChevronLeft />
                  </button>
                  <h3 className="font-bold text-lg max-w-[200px] truncate">
                    {selected.name}
                  </h3>
                </div>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2 text-gray-500"
                >
                  <FiX size={24} />
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

        {/* 4. BOTTOM TABS (Fixed Bottom) */}
        <div className="flex-shrink-0 z-40 bg-white border-t border-gray-200 dark:border-gray-800">
          <MobileTabs
            options={productTabs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
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
