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
      className="
        mt-5 p-4 rounded-xl 
        bg-gradient-to-br from-gray-50 to-white 
        dark:from-gray-800 dark:to-gray-700 
        border border-gray-200 dark:border-gray-700
        shadow-inner space-y-6
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
          <FiEdit className="text-blue-500" />
          Thông tin sản phẩm
        </h4>

        <button
          onClick={() => toast("⚠️ Mở modal xoá ở component cha")}
          className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
        >
          <FiTrash2 />
          Ẩn
        </button>
      </div>

      {/* Ảnh sản phẩm */}
      <div className="flex flex-col items-center gap-2">
        <img
          src={preview || selected.cover_image}
          className="
            w-40 h-40 sm:w-32 sm:h-32 
            rounded-xl object-cover 
            shadow border
          "
        />

        <label className="w-full text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="imagePicker"
          />
          <span
            className="
            cursor-pointer px-3 py-1.5 rounded-lg 
            bg-gray-200 dark:bg-gray-700 
            text-sm text-gray-700 dark:text-gray-200
            shadow
          "
          >
            Chọn ảnh mới
          </span>
        </label>
      </div>

      {/* Form */}
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

            toast.success("🎉 Đã lưu thay đổi!");
            await load(selected.id);
            setIsDirty(false);
            setPreview(null);
            setImage(null);
          } catch (err) {
            toast.error("❌ " + (err?.message || "Không thể cập nhật"));
          }
        }}
        className="grid gap-4"
      >
        {/* Card form */}
        <div
          className="
            p-4 rounded-xl bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3
          "
        >
          {["sku", "name", "category", "brand", "cost_price", "sale_price"].map(
            (key) => (
              <input
                key={key}
                className="input dark:bg-gray-900"
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

        {/* Footer button – chỉ hiện khi có thay đổi */}
        {isDirty && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="
              fixed md:static bottom-4 left-1/2 -translate-x-1/2 z-50 
              w-[90%] md:w-auto py-3 px-5 rounded-xl
              bg-green-600 hover:bg-green-700 
              text-white font-semibold shadow-xl 
              flex items-center justify-center gap-2
            "
          >
            <FiSave /> Lưu thay đổi
          </motion.button>
        )}
      </form>

      {/* Variants */}
      <div className="pt-2">
        <h4 className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-semibold text-base mb-1">
          🔻 Biến thể (Size & Màu)
        </h4>

        <ProductVariants productId={selected.id} />
      </div>
    </motion.div>
  );
}
