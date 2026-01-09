import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPackage,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiChevronLeft,
} from "react-icons/fi";
import VariantForm from "./VariantForm";
import VariantBulkForm from "./VariantBulkForm";

export default function ProductVariants({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [viewMode, setViewMode] = useState("list");

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const data = await api(`/variants/by-product/${productId}`);
      setVariants(data);
    } catch {
      notify.error("❌ Không thể tải danh sách biến thể");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  const handleDelete = async (id) => {
    const ok = await notify.confirm("🗑️ Bạn có chắc muốn xoá biến thể này?");
    if (!ok) return;
    try {
      await api(`/variants/${id}`, { method: "DELETE" });
      notify.success("🗑️ Đã xoá biến thể");
      load();
    } catch {
      notify.error("❌ Lỗi khi xoá biến thể");
    }
  };

  return (
    <>
      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-white/90 dark:bg-gray-900/90 
          p-4 sm:p-6 rounded-2xl 
          border shadow-xl space-y-5
          backdrop-blur-xl
        "
      >
        {/* MOBILE TABS */}
        <div className="md:hidden flex justify-between gap-2 bg-gray-100 p-1 rounded-xl shadow-inner">
          {[
            { id: "list", label: "Danh sách", icon: FiList },
            { id: "add", label: "Thêm", icon: FiPlus },
            { id: "bulk", label: "Nhiều", icon: FiGrid },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setViewMode(t.id);
                if (t.id === "add") {
                  setEditItem(null);
                  setShowForm(true);
                }
                if (t.id === "bulk") setShowBulk(true);
              }}
              className={`
                flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-semibold
                ${
                  viewMode === t.id
                    ? "bg-white shadow text-blue-600"
                    : "text-gray-500"
                }
              `}
            >
              <t.icon className="text-lg mb-1" />
              {t.label}
            </button>
          ))}
        </div>

        {/* HEADER PC */}
        <div className="hidden md:flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <FiPackage className="text-indigo-500" /> Biến thể sản phẩm
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditItem(null);
                setShowForm(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg flex items-center gap-1 shadow"
            >
              <FiPlus /> Thêm
            </button>

            <button
              onClick={() => setShowBulk(true)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border text-sm rounded-lg flex items-center gap-1"
            >
              <FiGrid /> Tạo nhiều
            </button>

            <button
              onClick={load}
              className="px-3 py-1.5 bg-gray-100 border text-gray-700 text-sm rounded-lg flex items-center gap-1"
            >
              <FiRefreshCw /> Làm mới
            </button>
          </div>
        </div>

        {/* LIST */}
        {viewMode === "list" && (
          <>
            {loading ? (
              <div className="text-center py-5 text-gray-500">
                ⏳ Đang tải...
              </div>
            ) : variants.length === 0 ? (
              <div className="text-center py-5 text-gray-500 italic">
                Chưa có biến thể nào.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {variants.map((v) => (
                  <motion.div
                    key={v.id}
                    whileTap={{ scale: 0.97 }}
                    className="
                      p-4 rounded-2xl bg-white dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-700 
                      shadow-md space-y-2
                    "
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {v.size}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {v.color}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Tồn kho:{" "}
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {v.stock}
                      </span>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      <button
                        onClick={() => {
                          setEditItem(v);
                          setShowForm(true);
                        }}
                        className="text-blue-600 dark:text-blue-400 text-lg"
                      >
                        <FiEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-red-600 dark:text-red-400 text-lg"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* -------------------------------------- */}
      {/* SLIDE-IN FORM THÊM / SỬA */}
      {/* -------------------------------------- */}
      {showForm && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-white dark:bg-gray-900 z-[999999] overflow-y-auto"
        >
          <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-700 dark:text-gray-200"
            >
              <FiChevronLeft size={22} />
            </button>
            <p className="font-semibold">
              {editItem ? "Sửa biến thể" : "Thêm biến thể"}
            </p>
          </div>

          {/* 🔥 Tăng padding-bottom lên pb-32 để không bị che bởi bottom nav */}
          <div className="p-4 pb-32 md:pb-10">
            <VariantForm
              productId={productId}
              editItem={editItem}
              onClose={() => setShowForm(false)}
              onSaved={() => {
                load();
                setShowForm(false);
              }}
            />
          </div>
        </motion.div>
      )}

      {/* -------------------------------------- */}
      {/* SLIDE-IN FORM TẠO NHIỀU */}
      {/* -------------------------------------- */}
      {showBulk && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-white dark:bg-gray-900 z-[999999] overflow-y-auto"
        >
          <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <button
              onClick={() => setShowBulk(false)}
              className="text-gray-700 dark:text-gray-200"
            >
              <FiChevronLeft size={22} />
            </button>
            <p className="font-semibold">Tạo nhiều biến thể</p>
          </div>

          {/* 🔥 Tăng padding-bottom lên pb-32 ở đây */}
          <div className="p-4 pb-32 md:pb-10">
            <VariantBulkForm
              productId={productId}
              onClose={() => setShowBulk(false)}
              onSaved={() => {
                load();
                setShowBulk(false);
              }}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}