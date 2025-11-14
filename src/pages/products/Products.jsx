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
      {/* PC LAYOUT (md+) – giữ nguyên 2 cột */}
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
              setViewMode("edit"); // nếu đang ở mobile, lần sau bấm tab "Sửa" sẽ có data
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
      {/* MOBILE LAYOUT – FULL SCREEN */}
      {/* --------------------------------------------------------------- */}
      <div className="md:hidden pt-[60px] pb-[80px] px-3">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
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
