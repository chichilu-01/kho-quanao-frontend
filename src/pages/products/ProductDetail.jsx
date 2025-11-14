import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSave } from "react-icons/fi";
import { useState } from "react";
import ProductVariants from "../../components/products/ProductVariants";

export default function ProductDetail({ selected, setSelected, load }) {
  const [isDirty, setIsDirty] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
    setIsDirty(true);
  };

  return (
    <motion.div
      key={selected.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-5 p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner space-y-5"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
          <FiEdit className="text-blue-500" /> Chi tiết & Biến thể
        </h4>
        <button
          onClick={() => toast("⚠️ Mở modal xoá từ component cha")}
          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
        >
          <FiTrash2 /> Ẩn sản phẩm
        </button>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const fd = new FormData();
            [
              "sku",
              "name",
              "category",
              "brand",
              "cost_price",
              "sale_price",
            ].forEach((k) => fd.append(k, selected[k] || ""));
            if (image) fd.append("image", image);

            const res = await fetch(
              `${import.meta.env.VITE_API_BASE}/products/${selected.id}`,
              { method: "PUT", body: fd },
            );
            const json = await res.json();
            if (!res.ok) throw new Error(json?.message || "Cập nhật thất bại");

            toast.success("✅ Đã cập nhật sản phẩm!");
            await load(selected.id);
            setIsDirty(false);
            setPreview(null);
            setImage(null);
          } catch (err) {
            toast.error("❌ " + (err?.message || "Không thể cập nhật"));
          }
        }}
        className="grid gap-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["sku", "name", "category", "brand", "cost_price", "sale_price"].map(
            (key) => (
              <input
                key={key}
                className="input dark:bg-gray-800"
                placeholder={key.replace("_", " ")}
                type={
                  ["cost_price", "sale_price"].includes(key) ? "number" : "text"
                }
                value={selected[key] ?? ""}
                onChange={(e) => {
                  setSelected({ ...selected, [key]: e.target.value });
                  setIsDirty(true);
                }}
              />
            ),
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 dark:text-gray-300 mt-1">
            Ảnh sản phẩm
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="input dark:bg-gray-800"
          />
          <img
            src={preview || selected.cover_image}
            className="w-28 h-28 rounded-lg object-cover border shadow mt-2 mx-auto"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-1">
          {isDirty && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-semibold shadow flex items-center gap-2 justify-center"
            >
              <FiSave /> Lưu thay đổi
            </motion.button>
          )}
        </div>
      </form>

      {/* Variants */}
      <ProductVariants productId={selected.id} />
    </motion.div>
  );
}
