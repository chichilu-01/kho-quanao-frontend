import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSave, FiChevronLeft } from "react-icons/fi";
import { useState } from "react";
import ProductVariants from "../../components/products/ProductVariants";

export default function ProductDetail({ selected, setSelected, load }) {
  const [isDirty, setIsDirty] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  // SCREEN BIẾN THỂ (SLIDE-IN)
  const [showVariantsScreen, setShowVariantsScreen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
    setIsDirty(true);
  };

  return (
    <>
      {/* MAIN PRODUCT DETAIL */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="
          mt-0 px-0 pt-4 pb-24 w-full rounded-none
          bg-white dark:bg-gray-900
          border-t border-gray-200 dark:border-gray-800

          md:mt-5 md:p-6 md:rounded-3xl
          md:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          md:bg-white/60 md:dark:bg-gray-900/60
          md:border md:border-white/40 md:dark:border-gray-700/50

          space-y-6 md:space-y-8
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200/50 dark:border-gray-700/40">
          <h4 className="font-semibold text-gray-900 dark:text-gray-50 text-xl flex items-center gap-2">
            <FiEdit className="text-blue-500" /> Chi tiết sản phẩm
          </h4>
          <button
            onClick={() => toast("⚠️ Mở modal xoá ở component cha")}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <FiTrash2 /> Xoá
          </button>
        </div>

        {/* IMAGE + BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
          {/* LEFT — IMAGE */}
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="
                w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden
                shadow-lg shadow-black/10
                border border-gray-300 dark:border-gray-700
                bg-white dark:bg-gray-800
              "
            >
              <img
                src={preview || selected.cover_image}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <label className="cursor-pointer mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm shadow border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Chọn ảnh mới
              </span>
            </label>
          </div>

          {/* RIGHT — BASIC INFO + VARIANT BUTTON */}
          <div className="space-y-4">
            {/* SKU */}
            <Field
              label="SKU"
              value={selected.sku}
              onChange={(v) => {
                setSelected({ ...selected, sku: v });
                setIsDirty(true);
              }}
            />

            {/* NAME */}
            <Field
              label="Tên SP"
              value={selected.name}
              onChange={(v) => {
                setSelected({ ...selected, name: v });
                setIsDirty(true);
              }}
            />

            {/* CATEGORY */}
            <Field
              label="Danh mục"
              value={selected.category}
              onChange={(v) => {
                setSelected({ ...selected, category: v });
                setIsDirty(true);
              }}
            />

            {/* BRAND */}
            <Field
              label="Thương hiệu"
              value={selected.brand}
              onChange={(v) => {
                setSelected({ ...selected, brand: v });
                setIsDirty(true);
              }}
            />

            {/* VARIANT BUTTON */}
            <button
              onClick={() => setShowVariantsScreen(true)}
              className="
                w-full py-2 rounded-xl
                bg-indigo-600 text-white 
                font-semibold shadow-md
                hover:bg-indigo-700 transition text-sm md:text-base
              "
            >
              🎨 Biến thể sản phẩm
            </button>
          </div>
        </div>

        {/* FORM FOR OTHER FIELDS */}
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
              if (!res.ok)
                throw new Error(json?.message || "Cập nhật thất bại");

              toast.success("🎉 Đã lưu thay đổi!");
              await load(selected.id);
              setIsDirty(false);
              setPreview(null);
              setImage(null);
            } catch (err) {
              toast.error("❌ " + (err?.message || "Không thể cập nhật"));
            }
          }}
          className="grid gap-6 px-4 md:px-0"
        >
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-gray-800/70 shadow-md border border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {["cost_price", "sale_price"].map((key) => (
              <Field
                key={key}
                label={key.replace("_", " ")}
                type="number"
                value={selected[key]}
                onChange={(v) => {
                  setSelected({ ...selected, [key]: v });
                  setIsDirty(true);
                }}
              />
            ))}
          </div>

          {/* SAVE BUTTON FLOATING */}
          {isDirty && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              className="
                fixed md:static bottom-4 left-1/2 -translate-x-1/2
                w-[88%] md:w-auto py-3 px-7 rounded-xl
                bg-gradient-to-r from-green-500 to-green-600
                text-white font-semibold shadow-xl shadow-green-400/30
                flex items-center justify-center gap-2
                z-[999]
              "
              type="submit"
            >
              <FiSave /> Lưu thay đổi
            </motion.button>
          )}
        </form>
      </motion.div>

      {/* VARIANTS SLIDE-IN */}
      {showVariantsScreen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
        >
          <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <button
              onClick={() => setShowVariantsScreen(false)}
              className="text-gray-700 dark:text-gray-200"
            >
              <FiChevronLeft size={22} />
            </button>
            <h3 className="font-semibold text-lg">Biến thể sản phẩm</h3>
          </div>

          <div className="p-4 pb-24">
            <ProductVariants productId={selected.id} />
          </div>
        </motion.div>
      )}
    </>
  );
}

/* SMALL FIELD COMPONENT */
function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        className="bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 ring-blue-400 dark:ring-blue-500 shadow-sm outline-none transition"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}
