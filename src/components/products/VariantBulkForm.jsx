import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { FiX, FiLayers, FiTag, FiChevronLeft } from "react-icons/fi";

export default function VariantBulkForm({ productId, onClose, onSaved }) {
  const [sizesInput, setSizesInput] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [defaultStock, setDefaultStock] = useState(0);

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

  const addTag = (type, value) => {
    if (!value) return;
    if (type === "size" && !sizes.includes(value))
      setSizesInput((prev) => (prev ? prev + ", " + value : value));

    if (type === "color" && !colors.includes(value))
      setColorsInput((prev) => (prev ? prev + ", " + value : value));
  };

  const removeTag = (type, value) => {
    if (type === "size")
      setSizesInput(sizes.filter((s) => s !== value).join(", "));
    else setColorsInput(colors.filter((c) => c !== value).join(", "));
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        fixed inset-0 z-[999999] 
        bg-white dark:bg-gray-900 
        overflow-y-auto
      "
    >
      {/* HEADER – AMAZON STYLE */}
      <div
        className="
          sticky top-0 z-10 
          bg-white/80 dark:bg-gray-900/80 
          backdrop-blur-xl 
          border-b border-gray-200 dark:border-gray-700
          flex items-center gap-3
          px-4 py-3
        "
      >
        <button
          onClick={onClose}
          className="text-gray-700 dark:text-gray-300 hover:text-indigo-600"
        >
          <FiChevronLeft size={26} />
        </button>

        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FiLayers className="text-indigo-500" />
          Tạo biến thể hàng loạt
        </h3>
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-6">
        {/* SIZE */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-semibold mb-2">Size</p>

          <input
            placeholder="S, M, L..."
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            className="
              w-full px-3 py-2 rounded-xl 
              bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-700 
              text-sm outline-none
            "
          />

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {["S", "M", "L", "XL", "XXL"].map((tag) => (
              <button
                key={tag}
                onClick={() => addTag("size", tag)}
                className="
                  px-3 py-1.5 rounded-xl text-xs 
                  bg-white dark:bg-gray-700 
                  border border-gray-300 dark:border-gray-600
                  hover:bg-indigo-600 hover:text-white 
                  transition
                "
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {sizes.map((s) => (
              <div
                key={s}
                className="
                  px-3 py-1 rounded-xl 
                  bg-indigo-100 text-indigo-700 
                  dark:bg-indigo-600 dark:text-white 
                  flex items-center gap-1 text-xs
                "
              >
                {s}
                <span
                  onClick={() => removeTag("size", s)}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* COLOR */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm">
          <p className="text-sm font-semibold mb-2">Màu sắc</p>

          <input
            placeholder="Đỏ, Đen, Trắng..."
            value={colorsInput}
            onChange={(e) => setColorsInput(e.target.value)}
            className="
              w-full px-3 py-2 rounded-xl 
              bg-white dark:bg-gray-900 
              border border-gray-300 dark:border-gray-700 
              text-sm outline-none
            "
          />

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {["Đỏ", "Đen", "Trắng", "Xanh", "Vàng"].map((tag) => (
              <button
                key={tag}
                onClick={() => addTag("color", tag)}
                className="
                  px-3 py-1.5 rounded-xl text-xs 
                  bg-white dark:bg-gray-700 
                  border border-gray-300 dark:border-gray-600
                  hover:bg-indigo-600 hover:text-white 
                  transition
                "
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {colors.map((c) => (
              <div
                key={c}
                className="
                  px-3 py-1 rounded-xl 
                  bg-rose-100 text-rose-700 
                  dark:bg-rose-600 dark:text-white 
                  flex items-center gap-1 text-xs
                "
              >
                {c}
                <span
                  onClick={() => removeTag("color", c)}
                  className="cursor-pointer opacity-70 hover:opacity-100"
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STOCK */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Tồn kho mặc định
          </p>

          <input
            type="number"
            placeholder="VD: 10"
            value={defaultStock}
            onChange={(e) => setDefaultStock(e.target.value)}
            className="
              w-full px-3 py-2 rounded-xl 
              bg-gray-50 dark:bg-gray-800 
              border border-gray-300 dark:border-gray-700 
              text-sm outline-none
            "
          />
        </div>

        {/* PREVIEW */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 space-y-2 max-h-48 overflow-auto shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-sm">
            <FiTag className="text-indigo-500" />
            Sẽ tạo {preview.length} biến thể
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {preview.map((v, i) => (
              <div
                key={i}
                className="
                  px-3 py-2 rounded-xl 
                  bg-white dark:bg-gray-900 
                  border border-gray-300 dark:border-gray-700
                  text-xs shadow-sm
                "
              >
                <strong>{v.size}</strong> • {v.color}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        className="
          sticky bottom-0 
          bg-white/90 dark:bg-gray-900/90 
          backdrop-blur-xl 
          border-t border-gray-300 dark:border-gray-700
          p-4 flex justify-end gap-3
        "
      >
        <button
          onClick={onClose}
          className="
            px-5 py-2 rounded-xl 
            bg-gray-200 dark:bg-gray-700 
            text-gray-900 dark:text-gray-100
          "
        >
          Hủy
        </button>

        <button
          onClick={handleCreate}
          className="
            px-6 py-2 rounded-xl 
            bg-gradient-to-r from-indigo-600 to-indigo-500 
            text-white font-semibold shadow-lg
          "
        >
          Tạo biến thể
        </button>
      </div>
    </motion.div>
  );
}
