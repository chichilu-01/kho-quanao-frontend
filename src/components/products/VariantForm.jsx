import { useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { FiSave, FiLayers, FiDroplet, FiBox } from "react-icons/fi";

export default function VariantForm({ productId, editItem, onClose, onSaved }) {
  const [form, setForm] = useState({
    size: editItem?.size || "",
    color: editItem?.color || "",
    stock: editItem?.stock || 0,
  });

  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.size || !form.color) {
      return notify.error("⚠️ Vui lòng nhập Size và Màu sắc");
    }

    setLoading(true);
    try {
      const body = {
        product_id: productId,
        size: form.size,
        color: form.color,
        stock: Number(form.stock) || 0,
      };

      if (editItem) {
        await api(`/variants/${editItem.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        notify.success("💾 Đã cập nhật biến thể");
      } else {
        await api("/variants", {
          method: "POST",
          body: JSON.stringify(body),
        });
        notify.success("✅ Đã thêm biến thể mới");
      }
      onSaved();
    } catch {
      notify.error("❌ Lỗi khi lưu biến thể");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KHUNG NHẬP LIỆU */}
      <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        {/* Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            <FiLayers /> Kích thước (Size)
          </label>
          <input
            placeholder="VD: S, M, L, 29, 30..."
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="
              w-full px-4 py-3 rounded-xl 
              bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-600 
              focus:ring-2 focus:ring-blue-500 outline-none transition
            "
          />
        </div>

        {/* Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            <FiDroplet /> Màu sắc
          </label>
          <input
            placeholder="VD: Đen, Trắng, Xanh..."
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="
              w-full px-4 py-3 rounded-xl 
              bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-600 
              focus:ring-2 focus:ring-blue-500 outline-none transition
            "
          />
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            <FiBox /> Tồn kho ban đầu
          </label>
          <input
            type="number"
            placeholder="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="
              w-full px-4 py-3 rounded-xl 
              bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-600 
              focus:ring-2 focus:ring-blue-500 outline-none transition font-mono
            "
          />
        </div>
      </div>

      {/* NÚT LƯU */}
      <button
        onClick={save}
        disabled={loading}
        className="
          w-full py-3.5 rounded-xl 
          bg-blue-600 hover:bg-blue-700 text-white font-bold 
          shadow-lg shadow-blue-200 dark:shadow-none 
          active:scale-95 transition-all
          flex items-center justify-center gap-2
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        {loading ? (
          <>⏳ Đang lưu...</>
        ) : (
          <>
            <FiSave className="text-lg" />
            {editItem ? "Lưu thay đổi" : "Thêm biến thể"}
          </>
        )}
      </button>

      <div className="text-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 underline decoration-dashed"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
}
