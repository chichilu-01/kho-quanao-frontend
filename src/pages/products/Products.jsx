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

  // ⭐ UI STATE MỚI: Quản lý chế độ xem (Lưới/Danh sách)
  const [listViewMode, setListViewMode] = useState("list"); // 'list' | 'grid'
  const [gridColumns, setGridColumns] = useState(3); // 2 | 3 | 4 cột

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
        // Desktop: Tự chọn item đầu tiên
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 md:p-6 transition-colors duration-300">
        <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

        {/* MOBILE TABS */}
        <div className="md:hidden">
          <MobileTabs
            options={productTabs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>

        {/* --- DESKTOP LAYOUT --- */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
          {/* CỘT TRÁI: DANH SÁCH & BỘ LỌC */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 lg:col-span-4 flex flex-col h-full space-y-4"
          >
            {/* Thanh công cụ: Tạo mới + Chuyển view */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center gap-2"
              >
                <FiPlus /> Thêm SP
              </button>

              {/* Toggle Grid/List */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setListViewMode("list")}
                  className={`p-2 rounded-md transition-all ${listViewMode === "list" ? "bg-white dark:bg-gray-600 shadow text-blue-600" : "text-gray-500"}`}
                >
                  <FiList />
                </button>
                <button
                  onClick={() => setListViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${listViewMode === "grid" ? "bg-white dark:bg-gray-600 shadow text-blue-600" : "text-gray-500"}`}
                >
                  <FiGrid />
                </button>
              </div>
            </div>

            {/* Container Danh sách */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col p-4">
              {listViewMode === "grid" && (
                <div className="flex justify-end gap-2 mb-3">
                  {[2, 3].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setGridColumns(cols)}
                      className={`text-xs font-bold px-2 py-1 rounded border ${gridColumns === cols ? "bg-blue-50 border-blue-200 text-blue-600" : "border-transparent text-gray-400"}`}
                    >
                      {cols} Cột
                    </button>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
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
                  // Props mới
                  viewType={listViewMode}
                  gridCols={gridColumns}
                />
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: CHI TIẾT / FORM */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-7 lg:col-span-8 h-full overflow-y-auto pr-1 custom-scrollbar"
          >
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 dark:border-gray-700 min-h-full p-6">
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
        <div className="md:hidden pb-24 pt-2 px-1">
          {viewMode === "list" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 min-h-[80vh]">
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
                viewType="list" // Mobile mặc định list cho dễ
              />
            </div>
          )}
          {viewMode === "create" && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <ProductForm load={load} />
            </div>
          )}
          {viewMode === "edit" && selected && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className="mb-4 text-sm text-gray-500 hover:text-blue-600"
              >
                ← Quay lại
              </button>
              <ProductDetail
                selected={selected}
                setSelected={setSelected}
                load={load}
              />
            </div>
          )}
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
