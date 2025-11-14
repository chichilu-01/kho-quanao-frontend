import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../../api/client";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";

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

  const load = async (selectId, q = "") => {
    try {
      setListLoading(true);
      const data = await api(
        `/products${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      setList(Array.isArray(data) ? data : []);
      if (selectId) {
        const found = data.find((x) => x.id === selectId);
        setSelected(found || null);
      } else if (!selected && data?.length) {
        setSelected(data[0]);
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

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 2200 }} />
      <div className="grid md:grid-cols-2 gap-6 p-4 animate-fadeIn">
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
