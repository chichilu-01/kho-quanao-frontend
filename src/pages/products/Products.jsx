import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // ✅ Import React Query
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  FiList,
  FiPlus,
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
// ✅ Import Skeleton vừa tạo
import ProductSkeleton from "../../components/products/ProductSkeleton";

export default function Products() {
  const queryClient = useQueryClient(); // Dùng để reload bằng tay khi cần
  const [selected, setSelected] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // Modals
  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [viewMode, setViewMode] = useState("list");
  const [listViewMode, setListViewMode] = useState("list");

  // 🔥 THAY ĐỔI LỚN: Dùng useQuery thay cho useEffect
  // isLoading: Biến này = true khi đang tải API
  const {
    data: list = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", search], // Khi biến 'search' đổi, tự động gọi lại API
    queryFn: async () => {
      // Gọi API
      const data = await api(
        `/products${search ? `?q=${encodeURIComponent(search)}` : ""}`,
      );
      return Array.isArray(data) ? data : [];
    },
    // Giữ dữ liệu cũ hiển thị trong lúc đang tìm kiếm mới (tránh nháy trắng)
    keepPreviousData: true,
  });

  // Hàm reload dùng cho form con (khi thêm/sửa xong)
  const reload = async () => {
    await queryClient.invalidateQueries(["products"]);
  };

  if (isError) {
    // Chỉ báo lỗi nhẹ, không làm crash app
    toast.error("Không thể kết nối Server!", { id: "err-load" });
  }

  // Filter Client-side (Thương hiệu)
  const brands = useMemo(
    () => [...new Set(list.map((p) => p.brand).filter(Boolean))],
    [list],
  );

  const filtered = useMemo(() => {
    return list.filter((p) => {
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      return matchBrand;
    });
  }, [list, selectedBrand]);

  const switchTab = (mode) => {
    if (mode === "edit" && !selected) {
      toast("⚠️ Chọn sản phẩm trước");
      return;
    }
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 overflow-hidden flex flex-col">
      <Toaster position="top-center" toastOptions={{ duration: 1500 }} />

      {/* ======================= PC LAYOUT ======================= */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* CỘT TRÁI */}
        <div className="w-[400px] lg:w-[450px] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shadow-xl z-10">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-20 shadow-sm shrink-0">
            {/* Header Controls */}
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
                  onClick={() => setSelected(null)}
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
                placeholder="Tìm kiếm tên, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {/* 🔥 LOGIC HIỂN THỊ SKELETON Ở ĐÂY */}
            {isLoading ? (
              <ProductSkeleton viewType={listViewMode} />
            ) : (
              <ProductList
                filtered={filtered}
                selected={selected}
                setSelected={setSelected}
                listLoading={false} // React Query lo việc loading rồi
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
            {selected ? (
              <ProductDetail
                selected={selected}
                setSelected={setSelected}
                load={reload}
              />
            ) : (
              <ProductForm load={reload} />
            )}
          </div>
        </div>
      </div>

      {/* ======================= MOBILE LAYOUT ======================= */}
      <div className="md:hidden flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-20">
        {viewMode === "list" && (
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all">
            <div className="flex items-center gap-2 px-3 h-[60px]">
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400 text-lg" />
                <input
                  className="w-full h-10 bg-gray-100 dark:bg-gray-800 pl-10 pr-2 rounded-full text-sm font-medium outline-none"
                  placeholder="Tìm sp..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
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
              <button
                onClick={() => switchTab("create")}
                className="w-10 h-10 flex items-center justify-center text-white bg-blue-600 rounded-full shadow-lg"
              >
                <FiPlus size={22} />
              </button>
            </div>
          </div>
        )}

        <div className="w-full">
          <AnimatePresence mode="wait">
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-2"
              >
                {/* 🔥 SKELETON CHO MOBILE */}
                {isLoading ? (
                  <ProductSkeleton viewType={listViewMode} />
                ) : (
                  <ProductList
                    filtered={filtered}
                    selected={selected}
                    setSelected={(p) => {
                      setSelected(p);
                      setViewMode("edit");
                      document
                        .querySelector(".md\\:hidden")
                        ?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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
                <div className="h-10"></div>
              </motion.div>
            )}

            {viewMode === "create" && (
              <motion.div
                key="create"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-white dark:bg-gray-900 min-h-screen"
              >
                <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 flex items-center gap-2 border-b dark:border-gray-800">
                  <button
                    onClick={() => setViewMode("list")}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 className="font-bold text-lg">Thêm sản phẩm</h3>
                </div>
                <ProductForm load={reload} />
              </motion.div>
            )}

            {viewMode === "edit" && (
              <motion.div
                key="edit"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-white dark:bg-gray-900 min-h-screen"
              >
                <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 flex items-center justify-between border-b dark:border-gray-800">
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
                {selected ? (
                  <ProductDetail
                    selected={selected}
                    setSelected={setSelected}
                    load={reload}
                  />
                ) : (
                  <div className="text-center py-10">Chưa chọn SP</div>
                )}
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
