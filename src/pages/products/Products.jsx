import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FiList, FiPlus, FiEdit3 } from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";
import MobileTabs from "../../components/common/MobileTabs";

// ❗️ THÊM ICON GRID
import { FiGrid } from "react-icons/fi";

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

  // ❗️ THÊM: số cột của dạng lưới
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
        setSelected(arr[0]);
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
      label: "Sửa",
      icon: FiEdit3,
      disabled: !selected,
    },
  ];

  // ------------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------------
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

      {/* TABS MOBILE */}
      <MobileTabs
        options={productTabs}
        viewMode={viewMode}
        setViewMode={setViewMode}
        className="fixed top-0 left-0 right-0 z-[9999] bg-white shadow-md"
      />

      {/* PC layout giữ nguyên */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <ProductForm load={load} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
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
          />

          {selected && (
            <ProductDetail
              selected={selected}
              setSelected={setSelected}
              load={load}
            />
          )}
        </motion.div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden px-3 pt-[70px] pb-[80px]">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {viewMode === "list" && (
            <>
              {/* ⭐ 4 NÚT: Toggle list/grid + 1/2/3 cột */}
              {/* 🔥 HÀNG NÚT PRO MAX */}
              <div className="flex justify-end gap-2 mb-4">
                {/* Toggle List / Grid */}
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.06 }}
                  onClick={() =>
                    setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                  }
                  className="
                    relative w-10 h-10 flex items-center justify-center
                    rounded-xl bg-white dark:bg-gray-800
                    shadow-sm border border-gray-200 dark:border-gray-700
                    transition-all overflow-hidden
                  "
                >
                  {/* Ripple */}
                  <span className="absolute inset-0 bg-blue-200/20 dark:bg-blue-400/10 opacity-0 hover:opacity-100 transition-all"></span>

                  {listViewMode === "grid" ? (
                    <FiGrid className="text-xl text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FiList className="text-xl text-blue-600 dark:text-blue-400" />
                  )}
                </motion.button>

                {/* BUTTON TEMPLATE */}
                {((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setGridColumns(num)}
                    className={`
                      relative px-4 h-10 flex items-center justify-center gap-1 rounded-xl text-sm font-semibold
                      overflow-hidden border transition-all
                      ${
                        gridColumns === num
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 shadow-sm"
                      }
                    `}
                  >
                    {/* Ripple overlay */}
                    <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all"></span>

                    {/* ICONS đẹp hơn */}
                    {num === 1 && (
                      <div className="grid grid-cols-1 gap-[2px] w-3 h-4">
                        <span className="block w-full h-full bg-current rounded"></span>
                      </div>
                    )}

                    {num === 2 && (
                      <div className="grid grid-cols-2 gap-[2px] w-3 h-4">
                        <span className="block bg-current rounded"></span>
                        <span className="block bg-current rounded"></span>
                      </div>
                    )}

                    {num === 3 && (
                      <div className="grid grid-cols-3 gap-[2px] w-3 h-4">
                        <span className="block bg-current rounded"></span>
                        <span className="block bg-current rounded"></span>
                        <span className="block bg-current rounded"></span>
                      </div>
                    )}

                    {num}
                  </motion.button>
                ))(1)}

                {((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setGridColumns(num)}
                    className={`
                      relative px-4 h-10 flex items-center justify-center gap-1 rounded-xl text-sm font-semibold
                      overflow-hidden border transition-all
                      ${
                        gridColumns === num
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 shadow-sm"
                      }
                    `}
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all"></span>

                    <div className="grid grid-cols-2 gap-[2px] w-3 h-4">
                      <span className="block bg-current rounded"></span>
                      <span className="block bg-current rounded"></span>
                    </div>

                    {num}
                  </motion.button>
                ))(2)}

                {((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setGridColumns(num)}
                    className={`
                      relative px-4 h-10 flex items-center justify-center gap-1 rounded-xl text-sm font-semibold
                      overflow-hidden border transition-all
                      ${
                        gridColumns === num
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 shadow-sm"
                      }
                    `}
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-all"></span>

                    <div className="grid grid-cols-3 gap-[2px] w-3 h-4">
                      <span className="block bg-current rounded"></span>
                      <span className="block bg-current rounded"></span>
                      <span className="block bg-current rounded"></span>
                    </div>

                    {num}
                  </motion.button>
                ))(3)}
              </div>

              {/* LIST MODE */}
              {listViewMode === "list" && (
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
                />
              )}

              {/* GRID MODE */}
              {listViewMode === "grid" && (
                <div className={`grid gap-3 grid-cols-${gridColumns}`}>
                  {filtered.map((p) => (
                    <motion.div
                      key={p.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setSelected(p);
                        setViewMode("edit");
                      }}
                      className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow cursor-pointer"
                    >
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      )}

                      <p className="font-semibold text-sm mt-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                        {p.name}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {p.brand || "—"} • {p.sku}
                      </p>

                      <p className="text-blue-600 dark:text-green-400 font-bold mt-2">
                        {Number(p.sale_price || 0).toLocaleString("vi-VN")}đ
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === "create" && <ProductForm load={load} />}
          {viewMode === "edit" && selected && (
            <ProductDetail
              selected={selected}
              setSelected={setSelected}
              load={load}
            />
          )}
        </motion.div>
      </div>

      {/* MODALS giữ nguyên */}
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
    </>
  );
}
