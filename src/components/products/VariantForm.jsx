// src/components/products/VariantForm.jsx
import { motion } from "framer-motion";
import { FiX, FiSave } from "react-icons/fi";
import { useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";

export default function VariantForm({ productId, editItem, onClose, onSaved }) {
  const [form, setForm] = useState({
    size: editItem?.size || "",
    color: editItem?.color || "",
    stock: editItem?.stock || 0,
  });

  const save = async () => {
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
      onClose();
    } catch {
      notify.error("❌ Lỗi khi lưu biến thể");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 p-6 rounded-2xl shadow-2xl w-full max-w-md space-y-4 border"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-lg text-gray-800">
            {editItem ? "✏️ Sửa biến thể" : "➕ Thêm biến thể"}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="grid gap-3 text-sm">
          <input
            placeholder="Size (VD: M, L...)"
            value={form.size}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="input"
          />
          <input
            placeholder="Màu sắc (VD: Đen, Trắng...)"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Tồn kho"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="input"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button onClick={onClose} className="btn bg-gray-200">
            <FiX /> Huỷ
          </button>
          <button onClick={save} className="btn bg-green-600 text-white">
            <FiSave /> Lưu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
