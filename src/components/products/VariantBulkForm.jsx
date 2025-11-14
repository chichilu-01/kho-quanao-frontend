// src/components/products/VariantBulkForm.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { FiX } from "react-icons/fi";

export default function VariantBulkForm({ productId, onClose, onSaved }) {
  const [bulk, setBulk] = useState({ sizes: "", colors: "", default_stock: 0 });

  const handleBulkCreate = async () => {
    const sizes = bulk.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = bulk.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const default_stock = Number(bulk.default_stock) || 0;

    if (!sizes.length || !colors.length)
      return notify.error("⚠️ Nhập ít nhất 1 size và 1 màu.");

    try {
      const res = await api("/variants/bulk", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          sizes,
          colors,
          default_stock,
        }),
      });
      notify.success(`✅ ${res.message}`);
      onSaved();
      onClose();
    } catch {
      notify.error("❌ Lỗi khi tạo biến thể hàng loạt");
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
        className="bg-white/95 p-6 rounded-2xl shadow-2xl w-full max-w-lg space-y-4 border"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-lg text-gray-800">
            🧩 Tạo nhiều biến thể
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
            placeholder="Size (VD: S, M, L)"
            value={bulk.sizes}
            onChange={(e) => setBulk({ ...bulk, sizes: e.target.value })}
            className="input"
          />
          <input
            placeholder="Màu sắc (VD: Đỏ, Đen)"
            value={bulk.colors}
            onChange={(e) => setBulk({ ...bulk, colors: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Tồn kho mặc định"
            value={bulk.default_stock}
            onChange={(e) =>
              setBulk({ ...bulk, default_stock: e.target.value })
            }
            className="input"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button onClick={onClose} className="btn bg-gray-200">
            Hủy
          </button>
          <button
            onClick={handleBulkCreate}
            className="btn bg-indigo-600 text-white"
          >
            Tạo biến thể
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
