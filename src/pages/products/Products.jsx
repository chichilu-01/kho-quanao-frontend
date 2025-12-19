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

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [listLoading, setListLoading] = useState(false);

  // Tabs mobile
  const [viewMode, setViewMode] = useState("list");

  // ⭐ UI STATE: Dùng chung cho cả PC và Mobile
  const [listViewMode, setListViewMode] = useState("list"); // 'list' | 'grid'
  const [gridColumns, setGridColumns] = useState(3); // Số cột trên PC

  // ------------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------------
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
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Toaster position="top-center" toastOptions={{ duration: 2000 }} />

        {/* MOBILE TABS (Bottom Navigation) */}
        <div className="md:hidden">
          <MobileTabs
            options={productTabs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* ============================================================ */}
        {/* PC LAYOUT (Fixed Height - Sửa lỗi đè) */}
        {/* ============================================================ */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 h-[calc(100vh-80px)] p-6 overflow-hidden">
          {/* CỘT TRÁI */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 lg:col-span-4 flex flex-col h-full space-y-4"
          >
            {/* Header Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  📦 Kho hàng{" "}
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  className="btn-primary text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
                >
                  <FiPlus /> Mới
                </button>
              </div>

              {/* View Switcher */}
              <div className="flex gap-2">
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

                {listViewMode === "grid" && (
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 flex-shrink-0">
                    {[2, 3].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setGridColumns(cols)}
                        className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${gridColumns === cols ? "bg-white text-blue-600 shadow" : "text-gray-400"}`}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List Container (Scrollable) */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative">
              <div className="absolute inset-0 overflow-y-auto pr-1 custom-scrollbar p-3">
                <ProductList
                  list={list}
                  filtered={filtered}
                  brands={brands}
                  selected={selected}
                  setSelected={setSelected}
                  listLoading={listLoading}
                  setSearch={setSearch}
                  search={search}
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  onRestock={(p) => {
                    setRestockProduct(p);
                    setRestockQty("");
                    setRestockModal(true);
                  }}
                  reload={load}
                  viewType={listViewMode}
                  gridCols={gridColumns}
                />
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 lg:col-span-8 h-full flex flex-col"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 flex-1 overflow-hidden relative">
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
            </div>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE LAYOUT (App-like & Fixed Header) */}
        {/* ============================================================ */}
        <div className="md:hidden flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-[80px]">
          {/* HEADER MOBILE: Sticky top */}
          {viewMode === "list" && (
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  📦 Kho ({list.length})
                </h2>

                {/* ⭐ NÚT CHUYỂN ĐỔI GRID/LIST Ở ĐÂY ⭐ */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                    }
                    className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-blue-600 dark:text-blue-400 active:scale-90 transition-transform border border-gray-200 dark:border-gray-700"
                  >
                    {/* Icon thay đổi tùy trạng thái */}
                    {listViewMode === "grid" ? (
                      <FiList size={18} />
                    ) : (
                      <FiGrid size={18} />
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

              {/* Search Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                  <input
                    className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Tìm kiếm..."
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
          <div className="flex-1 p-3">
            {viewMode === "list" && (
              <ProductList
                list={list}
                filtered={filtered}
                brands={brands}
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
                reload={load}
                // Mobile dùng chung state listViewMode với PC
                viewType={listViewMode}
                gridCols={2} // Mobile Grid luôn là 2 cột
              />
            )}

            {viewMode === "create" && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]"
              >
                <div
                  className="flex items-center gap-2 mb-4 text-gray-500 font-medium cursor-pointer"
                  onClick={() => setViewMode("list")}
                >
                  <div className="p-1 bg-gray-100 rounded-full">
                    <FiChevronLeft />
                  </div>{" "}
                  Quay lại
                </div>
                <ProductForm load={load} />
              </motion.div>
            )}

            {viewMode === "edit" && selected && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]"
              >
                <div
                  className="flex items-center gap-2 mb-4 text-gray-500 font-medium cursor-pointer"
                  onClick={() => setViewMode("list")}
                >
                  <div className="p-1 bg-gray-100 rounded-full">
                    <FiChevronLeft />
                  </div>{" "}
                  Quay lại
                </div>
                <ProductDetail
                  selected={selected}
                  setSelected={setSelected}
                  load={load}
                />
              </motion.div>
            )}
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
    </>
  );
}
