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
} from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";
import ProductSkeleton from "../../components/products/ProductSkeleton";

// 1. Import Context để xử lý ẩn hiện Menu
import { useNav } from "../../context/NavContext";

export default function Products() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  // viewMode quản lý các màn hình: 'list', 'create', 'edit'
  const [viewMode, setViewMode] = useState("list");
  // listViewMode quản lý kiểu hiển thị danh sách: 'list', 'grid'
  const [listViewMode, setListViewMode] = useState("list");

  // 2. Setup Hook ẩn hiện Menu
  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  // 3. Logic xử lý cuộn (Giống trang Orders)
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY < 0) return; // Bỏ qua elastic scroll iOS

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false); // Cuộn xuống -> Ẩn
    } else if (currentScrollY < lastScrollY.current) {
      setIsNavVisible(true); // Cuộn lên -> Hiện
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    setIsNavVisible(true);
  }, []);

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

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      return matchBrand;
    });
  }, [list, selectedBrand]);

  // Hàm chuyển đổi chế độ xem
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
    // 🔥 Cấu trúc container chính giống Orders: h-[100dvh] + overflow-hidden
    <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 flex flex-col overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />

      {/* ======================= PC LAYOUT (GIỮ NGUYÊN) ======================= */}
      <div className="hidden md:flex flex-1 overflow-hidden h-full">
        {/* CỘT TRÁI */}
        <div className="w-[400px] lg:w-[450px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shadow-xl z-10 h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-20 shadow-sm shrink-0">
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
                  className={`p-1.5 rounded-md ${listViewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
                >
                  <FiList size={18} />
                </button>
                <button
                  onClick={() => setListViewMode("grid")}
                  className={`p-1.5 rounded-md ${listViewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => switchMode("create")}
                  className="ml-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-blue-700"
                >
                  <FiPlus /> Mới
                </button>
              </div>
            </div>

            <div className="relative">
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
              <input
                className="w-full pl-9 pr-2 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

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
                gridCols={listViewMode === "grid" ? 2 : 1}
              />
            )}
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-gray-900 relative">
          <div className="max-w-5xl mx-auto p-8 pb-20">
            {viewMode === "create" ? (
              <ProductForm load={reload} />
            ) : selected ? (
              <ProductDetail
                selected={selected}
                setSelected={setSelected}
                load={reload}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p>Chọn sản phẩm để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================= MOBILE LAYOUT ======================= */}
      <div className="md:hidden flex-1 flex flex-col w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* 🔥 HEADER GỘP: SEARCH + BUTTONS (Luôn hiển thị khi ở List mode) */}
        {viewMode === "list" && (
          <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm">
            {/* 1. Ô Tìm kiếm */}
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

            {/* 2. Cụm nút List/Grid và Thêm Mới */}
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
                className="p-2 bg-blue-600 text-white rounded-lg shadow-md"
              >
                <FiPlus size={20} />
              </button>
            </div>
          </div>
        )}

        {/* BODY CONTENT - CÓ SCROLL LOGIC */}
        <div className="flex-1 overflow-hidden w-full relative">
          <AnimatePresence mode="wait">
            {/* 1. DANH SÁCH SẢN PHẨM */}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full"
              >
                {/* 🔥 Gắn onScroll vào đây */}
                <div
                  onScroll={handleScroll}
                  className="h-full w-full overflow-y-auto pb-2 px-1 scroll-smooth no-scrollbar"
                >
                  {isLoading ? (
                    <ProductSkeleton viewType={listViewMode} />
                  ) : (
                    <ProductList
                      filtered={filtered}
                      selected={selected}
                      // Khi click item -> chuyển sang viewMode 'edit'
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

            {/* 2. FORM TẠO MỚI */}
            {viewMode === "create" && (
              <motion.div
                key="create"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute inset-0 z-30 bg-white dark:bg-gray-900 flex flex-col"
              >
                {/* Header chi tiết */}
                <div className="shrink-0 flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <button
                    onClick={() => switchMode("list")}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 className="font-bold text-lg">Thêm sản phẩm mới</h3>
                </div>

                {/* Nội dung form - có scroll */}
                <div
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto pb-2"
                >
                  <ProductForm load={reload} />
                </div>
              </motion.div>
            )}

            {/* 3. CHI TIẾT / CHỈNH SỬA */}
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
                  className="flex-1 overflow-y-auto pb-2"
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
