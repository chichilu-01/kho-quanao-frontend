import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FiList, FiPlus, FiEdit3, FiGrid } from "react-icons/fi";
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

  // Dạng xem: list hoặc grid
  const [listViewMode, setListViewMode] = useState("grid");

  // Số cột của dạng lưới
  const [gridColumns, setGridColumns] = useState(2);

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
      } else if (!selected && arr?.length) {
        // Auto select first item on desktop if nothing selected
        if (window.innerWidth >= 768) {
          setSelected(arr[0]);
        }
      }
    } catch (err) {
      toast.error("❌ Lỗi tải danh sách sản phẩm");
      console.error(err);
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

  // -------------------------------------------------
  // TABS
  // -------------------------------------------------
  const productTabs = [
    { value: "list", label: "Danh sách", icon: FiList },
    { value: "create", label: "Thêm mới", icon: FiPlus },
    {
      value: "edit",
      label: "Chi tiết",
      icon: FiEdit3,
      disabled: !selected,
    },
  ];

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-3 md:p-6 transition-colors duration-300">
        <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

        {/* TABS MOBILE */}
        <div className="md:hidden">
          <MobileTabs
            options={productTabs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* --- PC LAYOUT (2 Columns) --- */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 p-4 animate-fadeIn h-[calc(100vh-100px)]">
          {/* LEFT COLUMN: LIST & FILTER */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 lg:col-span-4 flex flex-col h-full space-y-4"
          >
            {/* List Container */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col p-4">
              {/* Controls Row */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  {/* Grid/List Toggle */}
                  <button
                    onClick={() =>
                      setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                    }
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={
                      listViewMode === "grid"
                        ? "Chuyển sang danh sách"
                        : "Chuyển sang lưới"
                    }
                  >
                    {listViewMode === "grid" ? <FiList /> : <FiGrid />}
                  </button>

                  {/* Column Toggle (Only for Grid) */}
                  {listViewMode === "grid" && (
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      {[1, 2, 3].map((cols) => (
                        <button
                          key={cols}
                          onClick={() => setGridColumns(cols)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                            gridColumns === cols
                              ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          {cols}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FiPlus /> Tạo mới
                </button>
              </div>

              {/* Product List Content */}
              <div className="flex-1 overflow-y-auto pr-1">
                {/* Reuse ProductList Logic inside here or pass props */}
                <ProductList
                  list={list}
                  filtered={filtered}
                  brands={brands}
                  selected={selected}
                  setSelected={(p) => setSelected(p)}
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
                  // Pass view mode props
                  listViewMode={listViewMode}
                  gridColumns={gridColumns}
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: DETAIL / FORM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 lg:col-span-8 h-full overflow-y-auto pr-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full p-6">
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

        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden pt-[10px] pb-[90px] px-3 space-y-4">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {viewMode === "list" && (
              <>
                {/* Mobile Controls */}
                <div className="flex justify-end gap-2 mb-4 sticky top-[60px] z-10 py-2 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    {listViewMode === "grid" ? (
                      <FiGrid className="text-blue-500" />
                    ) : (
                      <FiList className="text-blue-500" />
                    )}
                  </motion.button>

                  <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                    {[1, 2].map((num) => (
                      <button
                        key={num}
                        onClick={() => setGridColumns(num)}
                        className={`w-10 h-8 rounded-lg text-sm font-bold transition-all ${
                          gridColumns === num
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "text-gray-400"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile List Content */}
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
                  listViewMode={listViewMode}
                  gridColumns={gridColumns}
                />
              </>
            )}

            {viewMode === "create" && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
                <ProductForm load={load} />
              </div>
            )}

            {viewMode === "edit" && selected && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
                <button
                  onClick={() => setViewMode("list")}
                  className="mb-4 text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600"
                >
                  ← Quay lại danh sách
                </button>
                <ProductDetail
                  selected={selected}
                  setSelected={setSelected}
                  load={load}
                />
              </div>
            )}
          </motion.div>
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
