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
  FiChevronLeft,
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

  // Xử lý chuyển tab mobile
  const switchTab = (mode) => {
    if (mode === "edit" && !selected) {
      toast("⚠️ Chọn sản phẩm trước");
      return;
    }
    setViewMode(mode);
    // Scroll lên đầu khi chuyển tab
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    // 1️⃣ ROOT: Dùng min-h-screen thay vì h-screen để cho phép cuộn toàn trang
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />

      {/* ======================= PC LAYOUT (Split View Infinite) ======================= */}
      <div className="hidden md:flex items-start">
        {/* CỘT TRÁI: Danh sách (Cuộn vô tận theo trang) */}
        <div className="w-[400px] lg:w-[450px] xl:w-[500px] min-h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shadow-xl z-10">
          {/* Header Cột Trái (Dính ở trên cùng) */}
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                📦 Kho hàng
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  {list.length}
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setListViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    listViewMode === "list"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <FiList size={18} />
                </button>
                <button
                  onClick={() => setListViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    listViewMode === "grid"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelected(null);
                    // PC: Scroll phải lên đầu để thấy form tạo mới
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                  <FiPlus /> Mới
                </button>
              </div>
            </div>

            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
              <input
                className="w-full pl-9 pr-2 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tìm kiếm tên, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List Content (Không overflow-auto nữa, để nó dài tự nhiên) */}
          <div className="p-3">
            <ProductList
              filtered={filtered}
              selected={selected}
              setSelected={(p) => {
                setSelected(p);
                // Trên PC không cần chuyển viewMode vì xem split view
              }}
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

        {/* CỘT PHẢI: Chi tiết (Sticky - Dính chặt khi cuộn trang) */}
        <div className="flex-1 sticky top-0 h-screen overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900">
          {/* Container giới hạn chiều rộng nội dung */}
          <div className="max-w-5xl mx-auto p-8">
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
      </div>

      {/* ======================= MOBILE LAYOUT (1 Cột Duy Nhất) ======================= */}
      <div className="md:hidden pb-20">
        {" "}
        {/* Padding bottom để không bị che bởi browser bar */}
        {/* HEADER MOBILE (Sticky - Dính trên cùng) */}
        {viewMode === "list" && (
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
            <div className="flex items-center gap-2 px-3 h-[60px]">
              {/* Search */}
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400 text-lg" />
                <input
                  className="w-full h-10 bg-gray-100 dark:bg-gray-800 pl-10 pr-2 rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Tìm sp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1">
                <div className="relative w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600">
                  <FiFilter size={18} />
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full"
                  >
                    <option value="">Tất cả</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {selectedBrand && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600"
                >
                  {listViewMode === "grid" ? (
                    <FiList size={20} />
                  ) : (
                    <FiGrid size={20} />
                  )}
                </button>
              </div>

              {/* Nav Icons Separator */}
              <div className="w-[1px] h-6 bg-gray-300 mx-1"></div>

              {/* Create Button */}
              <button
                onClick={() => switchTab("create")}
                className="w-10 h-10 flex items-center justify-center text-white bg-blue-600 rounded-full shadow-lg shadow-blue-500/40"
              >
                <FiPlus size={22} />
              </button>
            </div>
          </div>
        )}
        {/* BODY MOBILE (Chảy tự nhiên) */}
        <div className="p-2">
          <AnimatePresence mode="wait">
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProductList
                  filtered={filtered}
                  selected={selected}
                  setSelected={(p) => {
                    setSelected(p);
                    setViewMode("edit");
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                {/* Khoảng trống dưới cùng để lướt hết */}
                <div className="h-10"></div>
              </motion.div>
            )}

            {viewMode === "create" && (
              <motion.div
                key="create"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-2 flex items-center gap-2 border-b mb-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 className="font-bold text-lg">Thêm sản phẩm mới</h3>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <ProductForm load={load} />
                </div>
              </motion.div>
            )}

            {viewMode === "edit" && (
              <motion.div
                key="edit"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
              >
                <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md p-2 flex items-center justify-between border-b mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <h3 className="font-bold text-lg truncate max-w-[200px]">
                      {selected?.name || "Chi tiết"}
                    </h3>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4">
                  {selected ? (
                    <ProductDetail
                      selected={selected}
                      setSelected={setSelected}
                      load={load}
                    />
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Chưa chọn sản phẩm
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
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
