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

// ❗️ THÊM MỚI: Toggle dạng list / grid
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

  // 🔥 Tabs cho MOBILE: list | create | edit
  const [viewMode, setViewMode] = useState("list");

  // ❗️ THÊM MỚI: chỉ để đổi list ↔ grid, KHÔNG ảnh hưởng logic cũ
  const [listViewMode, setListViewMode] = useState("grid"); // list | grid

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
  // FILTERS
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
  // Cấu hình tabs cho trang Products (mobile)
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

      {/* TABS MOBILE (chỉ hiện dưới md) */}
      <MobileTabs
        options={productTabs}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* --------------------------------------------------------------- */}
      {/* PC LAYOUT (md+) – giữ nguyên hoàn toàn */}
      {/* --------------------------------------------------------------- */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 animate-fadeIn">
        {/* LEFT: FORM TẠO SẢN PHẨM */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <ProductForm load={load} />
        </motion.div>

        {/* RIGHT: LIST + DETAIL */}
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

      {/* --------------------------------------------------------------- */}
      {/* MOBILE LAYOUT */}
      {/* --------------------------------------------------------------- */}
      <div className="md:hidden pt-[60px] pb-[80px] px-3">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {viewMode === "list" && (
            <>
              {/* Nút đổi List ↔ Grid (mới thêm) */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() =>
                    setListViewMode((m) => (m === "list" ? "grid" : "list"))
                  }
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  {listViewMode === "grid" ? (
                    <FiGrid className="text-xl" />
                  ) : (
                    <FiList className="text-xl" />
                  )}
                </button>
              </div>

              {/* LIST VIEW (giữ nguyên ProductList) */}
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

              {/* GRID VIEW */}

              {listViewMode === "grid" && (
                <div className="grid grid-cols-2 gap-3">
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
                      {/* ẢNH – dùng đúng cover_image giống ProductList */}
                      {p.cover_image ? (
                        <img
                          src={p.cover_image}
                          alt=""
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      )}

                      {/* TÊN */}
                      <p className="font-semibold text-sm mt-2 line-clamp-2 text-gray-900 dark:text-gray-100">
                        {p.name}
                      </p>

                      {/* BRAND + SKU */}
                      <p className="text-xs text-gray-500 mt-1">
                        {p.brand || "—"} • {p.sku}
                      </p>

                      {/* GIÁ — dùng đúng hàm format trong ProductList */}
                      <p className="text-blue-600 dark:text-green-400 font-bold mt-2">
                        {Number(p.sale_price || 0).toLocaleString("vi-VN")}đ
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === "create" && (
            <div className="w-full">
              <ProductForm load={load} />
            </div>
          )}

          {viewMode === "edit" && selected && (
            <div className="w-full">
              <ProductDetail
                selected={selected}
                setSelected={setSelected}
                load={load}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* MODALS */}
      {/* --------------------------------------------------------------- */}
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
