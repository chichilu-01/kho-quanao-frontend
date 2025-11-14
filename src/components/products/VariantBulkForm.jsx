// src/components/products/VariantBulkForm.jsx
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { FiX, FiLayers, FiTag } from "react-icons/fi";

export default function VariantBulkForm({ productId, onClose, onSaved }) {
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [defaultStock, setDefaultStock] = useState(0);

  // -----------------------------------------------------
  // ᴘʀᴏ: TAG SELECT – auto split by comma
  // -----------------------------------------------------
  const sizes = useMemo(
    () =>
      sizesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [sizesInput],
  );

  const colors = useMemo(
    () =>
      colorsInput
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    [colorsInput],
  );

  const preview = useMemo(() => {
    let list = [];
    sizes.forEach((s) =>
      colors.forEach((c) => list.push({ size: s, color: c })),
    );
    return list;
  }, [sizes, colors]);

  // -----------------------------------------------------
  // CREATE
  // -----------------------------------------------------
  const handleCreate = async () => {
    if (!sizes.length || !colors.length)
      return notify.error("⚠️ Hãy nhập ít nhất 1 size và 1 màu");

    try {
      const res = await api("/variants/bulk", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          sizes,
          colors,
          default_stock: Number(defaultStock) || 0,
        }),
      });

      notify.success(`✨ ${res.message}`);
      onSaved();
      onClose();
    } catch {
      notify.error("❌ Lỗi tạo biến thể");
    }
  };

  // -----------------------------------------------------
  // PRO UI
  // -----------------------------------------------------
  const addTag = (type, value) => {
    if (!value) return;
    if (type === "size") {
      if (!sizes.includes(value)) {
        setSizesInput((prev) => (prev ? prev + ", " + value : value));
      }
    } else {
      if (!colors.includes(value)) {
        setColorsInput((prev) => (prev ? prev + ", " + value : value));
      }
    }
  };

  const removeTag = (type, value) => {
    if (type === "size") {
      setSizesInput(sizes.filter((s) => s !== value).join(", "));
    } else {
      setColorsInput(colors.filter((c) => c !== value).join(", "));
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-200 dark:border-gray-700 space-y-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <FiLayers className="text-indigo-500" />
            Tạo biến thể hàng loạt (PRO)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* INPUT GROUP */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* SIZE */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <p className="text-sm font-semibold mb-2">Size</p>
            <input
              placeholder="S, M, L..."
              value={sizesInput}
              onChange={(e) => setSizesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-indigo-500 outline-none text-sm"
            />

            {/* tag select nhanh */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["S", "M", "L", "XL", "XXL"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag("size", tag)}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 hover:bg-indigo-600 hover:text-white transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* tag chip */}
            <div className="flex flex-wrap gap-2 mt-3">
              {sizes.map((s) => (
                <div
                  key={s}
                  className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-600 dark:text-white flex items-center gap-1 text-xs"
                >
                  {s}
                  <span
                    onClick={() => removeTag("size", s)}
                    className="cursor-pointer text-xs opacity-70 hover:opacity-100"
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* COLOR */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <p className="text-sm font-semibold mb-2">Màu sắc</p>
            <input
              placeholder="Đỏ, Đen, Trắng..."
              value={colorsInput}
              onChange={(e) => setColorsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-indigo-500 outline-none text-sm"
            />

            {/* tag nhanh */}
            <div className="flex flex-wrap gap-2 mt-3">
              {["Đỏ", "Đen", "Trắng", "Xanh", "Vàng"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag("color", tag)}
                  className="px-3 py-1.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 hover:bg-indigo-600 hover:text-white transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* chip */}
            <div className="flex flex-wrap gap-2 mt-3">
              {colors.map((c) => (
                <div
                  key={c}
                  className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-600 dark:text-white text-rose-700 flex items-center gap-1 text-xs"
                >
                  {c}
                  <span
                    onClick={() => removeTag("color", c)}
                    className="cursor-pointer text-xs opacity-70 hover:opacity-100"
                  >
                    ×
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STOCK */}
        <div>
          <p className="text-sm mb-1">Tồn kho mặc định</p>
          <input
            type="number"
            placeholder="VD: 10"
            value={defaultStock}
            onChange={(e) => setDefaultStock(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-indigo-500 outline-none text-sm"
          />
        </div>

        {/* PREVIEW */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-300 dark:border-gray-700 max-h-48 overflow-auto">
          <p className="flex items-center gap-2 font-semibold text-sm mb-2">
            <FiTag className="text-indigo-500" />
            Sẽ tạo {preview.length} biến thể
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {preview.map((v, i) => (
              <div
                key={i}
                className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm"
              >
                <strong>{v.size}</strong> • {v.color}
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          >
            Hủy
          </button>

          <button
            onClick={handleCreate}
            className="px-6 py-2 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-md"
          >
            Tạo biến thể
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
