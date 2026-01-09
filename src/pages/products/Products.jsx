import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiList,
  FiPlus,
  FiGrid,
  FiSearch,
  FiChevronLeft,
  FiFilter,
  FiPackage,
  FiAlertCircle,
  FiDollarSign,
  FiBox,
} from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";
import ProductSkeleton from "../../components/products/ProductSkeleton";

// Context
import { useNav } from "../../context/NavContext";

// --- UTILS FORMAT TIỀN ---
const money = (number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    number,
  );

export default function Products() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  // Quản lý view
  const [viewMode, setViewMode] = useState("list");
  const [listViewMode, setListViewMode] = useState("list");

  // Nav Context
  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  // --- LOGIC SCROLL MOBILE (ĐÃ SỬA LỖI NHẤP NHÁY) ---
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;

    // 1. Chặn overscroll (kéo quá đà ở trên cùng)
    if (currentScrollY < 0) return;

    // 2. Tính khoảng cách thay đổi (delta)
    const diff = currentScrollY - lastScrollY.current;

    // 3. THRESHOLD: Chỉ xử lý nếu cuộn nhiều hơn 10px để tránh rung tay
    if (Math.abs(diff) < 10) return;

    // 4. Logic Ẩn/Hiện
    // Chỉ ẩn khi cuộn xuống (diff > 0) và đã kéo xuống một đoạn (> 60px)
    if (diff > 0 && currentScrollY > 60) {
      setIsNavVisible(false);
    } else if (diff < 0) {
      // Hiện lại khi cuộn lên
      setIsNavVisible(true);
    }

    // 5. Cập nhật vị trí cũ
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    setIsNavVisible(true);
  }, []);

  // --- QUERY DATA ---
  const {
    data: list = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      const data = await api(
        `/products${search ? `?q=${encodeURIComponent(search)}` : ""}`,
      );
      return Array.isArray(data) ? data : [];
    },
    keepPreviousData: true,
  });

  const reload = async () => {
    await queryClient.invalidateQueries(["products"]);
  };

  if (isError) {
    toast.error("Không thể kết nối Server!", { id: "err-load" });
  }

  // --- FILTER & STATS ---
  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      return matchBrand;
    });
  }, [list, selectedBrand]);

  const stats = useMemo(() => {
    const totalItems = list.length;
    const outOfStock = list.filter((p) => (p.quantity || 0) <= 0).length;
    // Giả sử có trường price và quantity
    const totalValue = list.reduce(
      (acc, p) => acc + Number(p.price || 0) * Number(p.quantity || 0),
      0,
    );
    return { totalItems, outOfStock, totalValue };
  }, [list]);

  // --- HANDLERS ---
  const switchMode = (mode, product = null) => {
    if (mode === "edit" && product) {
      setSelected(product);
      setViewMode("edit");
    } else if (mode === "create") {
      setSelected(null);
      setViewMode("create");
    } else {
      setViewMode("list");
      setSelected(null);
    }
  };

  return (
    // 🔥 FIX 1: pt-0 md:pt-16 (Giữ nguyên fix header PC)
    <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 flex flex-col overflow-hidden transition-colors duration-300 pt-0 md:pt-16">
      {/* 🔥 FIX 2: THÊM STYLE ẨN THANH CUỘN CHO MOBILE */}
      <style>{`
        .hide-scroll-force::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scroll-force { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      {/* ======================= PC LAYOUT (MODERNIZED) ======================= */}
      <div className="hidden md:flex flex-col h-full w-full overflow-hidden">
        {/* 1. PC TOP BAR: STATS & TITLE */}
        <div className="shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm z-20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                <FiPackage />
              </span>
              Kho Hàng
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-12">
              Quản lý sản phẩm và tồn kho
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="flex gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                <FiBox size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Tổng SP
                </p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
                  {stats.totalItems}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl">
              <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 dark:text-red-300">
                <FiAlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Hết hàng
                </p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">
                  {stats.outOfStock}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-300">
                <FiDollarSign size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">
                  Giá trị kho
                </p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">
                  {money(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PC MAIN CONTENT SPLIT */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR: LIST & TOOLS (30-35%) */}
          <div className="w-[380px] lg:w-[420px] xl:w-[480px] flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl z-10">
            {/* Tools */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
              <div className="relative group">
                <FiSearch className="absolute top-3 left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-900/50 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl text-sm outline-none transition-all"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 dark:bg-gray-900/50 p-1 rounded-lg">
                  <button
                    onClick={() => setListViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${listViewMode === "list" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <FiList size={16} />
                  </button>
                  <button
                    onClick={() => setListViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${listViewMode === "grid" ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <FiGrid size={16} />
                  </button>
                </div>
                <button
                  onClick={() => switchMode("create")}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  <FiPlus size={16} /> Thêm mới
                </button>
              </div>
            </div>

            {/* Product List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {isLoading ? (
                <ProductSkeleton viewType={listViewMode} />
              ) : (
                <ProductList
                  filtered={filtered}
                  selected={selected}
                  setSelected={(p) => switchMode("edit", p)}
                  listLoading={false}
                  onRestock={(p) => {
                    setRestockProduct(p);
                    setRestockQty("");
                    setRestockModal(true);
                  }}
                  viewType={listViewMode}
                  gridCols={2} // Grid 2 cột cho sidebar
                />
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: DETAILS & FORMS (65-70%) */}
          <div className="flex-1 bg-gray-50/50 dark:bg-gray-900/50 relative overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
              <AnimatePresence mode="wait">
                {viewMode === "create" ? (
                  <motion.div
                    key="create-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                      <h2 className="text-lg font-bold">Thêm sản phẩm mới</h2>
                      <button
                        onClick={() => setViewMode("list")}
                        className="text-sm text-gray-500 hover:text-red-500"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                    <div className="p-6">
                      <ProductForm
                        load={reload}
                        onSuccess={() => setViewMode("list")}
                      />
                    </div>
                  </motion.div>
                ) : selected ? (
                  <motion.div
                    key="detail-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="h-full"
                  >
                    <ProductDetail
                      selected={selected}
                      setSelected={setSelected}
                      load={reload}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-gray-300 dark:text-gray-600 select-none"
                  >
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <FiPackage size={64} className="opacity-50" />
                    </div>
                    <p className="text-xl font-medium">
                      Chọn một sản phẩm để xem chi tiết
                    </p>
                    <p className="text-sm mt-2">
                      Hoặc nhấn "Thêm mới" để tạo kho
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ======================= MOBILE LAYOUT (UPDATED) ======================= */}
      <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* MOBILE HEADER */}
        {viewMode === "list" && (
          <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm">
            <div className="flex-1 relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
              <input
                className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm outline-none dark:text-white"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute top-2.5 right-3 text-gray-400"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-1 shrink-0">
              <button
                onClick={() =>
                  setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                }
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
              >
                {listViewMode === "grid" ? (
                  <FiList size={20} />
                ) : (
                  <FiGrid size={20} />
                )}
              </button>
              <button
                onClick={() => switchMode("create")}
                className="p-2 bg-blue-600 text-white rounded-lg shadow-md active:scale-95 transition-transform"
              >
                <FiPlus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* MOBILE BODY - 🔥 FIX GAP & SCROLLBAR */}
        <div className="flex-1 overflow-hidden w-full relative">
          <AnimatePresence mode="wait">
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full"
              >
                {/* 🔥 FIX 3: Áp dụng class hide-scroll-force và chỉnh pb-4 (đủ nhỏ) */}
                <div
                  onScroll={handleScroll}
                  className="h-full w-full overflow-y-auto pb-0 px-1 scroll-smooth hide-scroll-force"
                >
                  {isLoading ? (
                    <ProductSkeleton viewType={listViewMode} />
                  ) : (
                    <ProductList
                      filtered={filtered}
                      selected={selected}
                      setSelected={(p) => switchMode("edit", p)}
                      listLoading={false}
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
              </motion.div>
            )}

            {viewMode === "create" && (
              <motion.div
                key="create"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-30 bg-white dark:bg-gray-900 flex flex-col"
              >
                <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <button
                    onClick={() => switchMode("list")}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 className="font-bold text-lg">Thêm sản phẩm mới</h3>
                </div>
                <div
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto pb-0 hide-scroll-force"
                >
                  <ProductForm
                    load={reload}
                    onSuccess={() => setViewMode("list")}
                  />
                </div>
              </motion.div>
            )}

            {viewMode === "edit" && (
              <motion.div
                key="edit"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-30 bg-white dark:bg-gray-900 flex flex-col"
              >
                <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <button
                    onClick={() => switchMode("list")}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 className="font-bold text-lg truncate flex-1">
                    {selected?.name || "Chi tiết sản phẩm"}
                  </h3>
                </div>
                <div
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto pb-0 hide-scroll-force"
                >
                  {selected && (
                    <ProductDetail
                      selected={selected}
                      setSelected={setSelected}
                      load={reload}
                    />
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
        reload={reload}
      />
      <DeleteModal
        open={deleteModal}
        setOpen={setDeleteModal}
        selected={selected}
        reload={reload}
        clearSelected={() => setSelected(null)}
      />
    </div>
  );
}
