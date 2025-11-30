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
} from "react-icons/fi";
import VariantForm from "./VariantForm";
import VariantBulkForm from "./VariantBulkForm";

export default function ProductVariants({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // 🔥 View mode cho mobile
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
      {/* ------------------------------------------------------ */}
      {/* 🔥 MOBILE TABS ĐẸP NHƯ ALIBABA */}
      {/* ------------------------------------------------------ */}
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
              setShowForm(t.id === "add");
              setShowBulk(t.id === "bulk");
            }}
            className={`
              flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-semibold
              ${viewMode === t.id 
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

      {/* ------------------------------------------------------ */}
      {/* 🔥 HEADER PC */}
      {/* ------------------------------------------------------ */}
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

      {/* ------------------------------------------------------ */}
      {/* 🔥 LIST – MOBILE STYLE ALIBABA */}
      {/* ------------------------------------------------------ */}
      {viewMode === "list" && (
        <>
          {loading ? (
            <div className="text-center py-5 text-gray-500">⏳ Đang tải...</div>
          ) : variants.length === 0 ? (
            <div className="text-center py-5 text-gray-500 italic">
              Chưa có biến thể nào.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {variants.map((v) => (
                <motion.div
                  key={v.id}
                  whileHover={{ scale: 1.02 }}
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
                        setShowBulk(false);
                        setViewMode("add");
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

      {/* ------------------------------------------------------ */}
      {/* 🔥 FORM THÊM / SỬA */}
      {/* ------------------------------------------------------ */}
      {showForm && (
        <VariantForm
          productId={productId}
          editItem={editItem}
          onClose={() => {
            setShowForm(false);
            setViewMode("list");
          }}
          onSaved={load}
        />
      )}

      {/* ------------------------------------------------------ */}
      {/* 🔥 FORM TẠO NHIỀU */}
      {/* ------------------------------------------------------ */}
      {showBulk && (
        <VariantBulkForm
          productId={productId}
          onClose={() => {
            setShowBulk(false);
            setViewMode("list");
          }}
          onSaved={load}
        />
      )}
    </motion.div>
  );
}
