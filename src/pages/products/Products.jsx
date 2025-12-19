import { useEffect, useMemo, useState, useRef } from "react";
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
  const [gridColumns, setGridColumns] = useState(3);

  // ⭐ SCROLL STATE (Để ẩn/hiện Header)
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

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

  // Xử lý chuyển tab
  const switchTab = (mode) => {
    if (mode === "edit" && !selected) {
      toast("⚠️ Chọn sản phẩm trước");
      return;
    }
    setViewMode(mode);
  };

  // ⭐ Xử lý sự kiện cuộn để ẩn/hiện header
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      // Đang cuộn xuống & đã cuộn quá 50px -> Ẩn Header
      setShowHeader(false);
    } else {
      // Đang cuộn lên -> Hiện Header
      setShowHeader(true);
    }
    lastScrollY.current = currentScrollY;
  };

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />

      {/* ======================= PC LAYOUT (Giữ nguyên) ======================= */}
      <div className="hidden md:flex flex-1 gap-6 p-6 overflow-hidden h-full">
        {/* Cột trái */}
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
        {/* Cột phải */}
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

      {/* ======================= MOBILE LAYOUT (SMART HEADER) ======================= */}
      <div className="md:hidden flex flex-col h-full relative">
        {/* 🔥 SMART HEADER (1 DÒNG DUY NHẤT) */}
        {viewMode === "list" && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: showHeader ? 0 : -80 }} // Trượt lên khi ẩn
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center gap-2 p-2 h-[60px]">
              {/* 1. THANH TÌM KIẾM (Co giãn) */}
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400 text-lg" />
                <input
                  className="w-full h-10 bg-gray-100 dark:bg-gray-800 pl-10 pr-2 rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Tìm sp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* 2. CÁC CÔNG CỤ (Lọc + View) */}
              <div className="flex items-center gap-1">
                {/* Lọc Hãng (Icon Filter có select ẩn) */}
                <div className="relative w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
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

                {/* Chuyển Grid/List */}
                <button
                  onClick={() =>
                    setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                  }
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
                >
                  {listViewMode === "grid" ? (
                    <FiList size={20} />
                  ) : (
                    <FiGrid size={20} />
                  )}
                </button>
              </div>

              {/* 3. ĐIỀU HƯỚNG (Vạch ngăn cách) */}
              <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

              {/* 4. TABS (Nav Icons) */}
              <div className="flex items-center gap-1">
                {/* Danh sách (Active) */}
                <button
                  onClick={() => switchTab("list")}
                  className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full"
                >
                  <FiList size={20} />
                </button>

                {/* Thêm mới */}
                <button
                  onClick={() => switchTab("create")}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <FiPlus size={22} />
                </button>

                {/* Chi tiết */}
                <button
                  onClick={() => switchTab("edit")}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${selected ? "text-gray-600" : "text-gray-300"}`}
                >
                  <FiEdit3 size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- BODY (SCROLLABLE) --- */}
        <div
          className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900"
          onScroll={handleScroll} // ⭐ Lắng nghe sự kiện cuộn ở đây
        >
          {/* Padding top = chiều cao header để nội dung không bị che ban đầu */}
          <div
            className={`transition-all duration-300 ${viewMode === "list" ? "pt-[60px]" : ""} p-2 pb-24`}
          >
            <AnimatePresence mode="wait">
              {/* LIST VIEW */}
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
                  <div className="flex items-center gap-2 mb-3 px-2 pt-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className="p-2 bg-white rounded-full shadow-sm"
                    >
                      <FiChevronLeft />
                    </button>
                    <h3 className="font-bold text-lg">Thêm mới</h3>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]">
                    <ProductForm load={load} />
                  </div>
                </motion.div>
              )}

              {/* EDIT VIEW */}
              {viewMode === "edit" && (
                <motion.div
                  key="edit"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-3 px-2 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("list")}
                        className="p-2 bg-white rounded-full shadow-sm"
                      >
                        <FiChevronLeft />
                      </button>
                      <h3 className="font-bold text-lg truncate max-w-[200px]">
                        {selected?.name || "Chi tiết"}
                      </h3>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]">
                    {selected ? (
                      <ProductDetail
                        selected={selected}
                        setSelected={setSelected}
                        load={load}
                      />
                    ) : (
                      <div className="text-center py-10">
                        Chưa chọn sản phẩm
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
