// src/components/products/ProductVariants.jsx
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
} from "react-icons/fi";
import VariantForm from "./VariantForm";
import VariantBulkForm from "./VariantBulkForm";

export default function ProductVariants({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editItem, setEditItem] = useState(null);

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
      className="bg-white/90 p-4 sm:p-6 rounded-2xl border shadow-md space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 text-gray-800">
          <FiPackage className="text-indigo-500" /> Biến thể sản phẩm
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}
            className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-md text-sm"
          >
            <FiPlus /> Thêm
          </button>

          <button
            onClick={() => setShowBulk(true)}
            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border text-sm"
          >
            <FiGrid /> Tạo nhiều
          </button>

          <button
            onClick={load}
            className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg border text-sm"
          >
            <FiRefreshCw /> Làm mới
          </button>
        </div>
      </div>

      {/* Danh sách biến thể */}
      {loading ? (
        <div className="text-gray-500 text-sm">⏳ Đang tải...</div>
      ) : variants.length === 0 ? (
        <div className="text-gray-500 text-sm italic text-center py-3">
          Chưa có biến thể nào.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-inner">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Size</th>
                <th className="p-2 text-left">Màu</th>
                <th className="p-2 text-right">Tồn kho</th>
                <th className="p-2 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{v.size}</td>
                  <td className="p-2">{v.color}</td>
                  <td className="p-2 text-right">{v.stock}</td>
                  <td className="p-2 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditItem(v);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <VariantForm
          productId={productId}
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}

      {showBulk && (
        <VariantBulkForm
          productId={productId}
          onClose={() => setShowBulk(false)}
          onSaved={load}
        />
      )}
    </motion.div>
  );
}
