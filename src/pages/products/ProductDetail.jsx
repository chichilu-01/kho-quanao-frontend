import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2, FiSave, FiChevronLeft } from "react-icons/fi";
import { useState } from "react";
import ProductVariants from "../../components/products/ProductVariants";

export default function ProductDetail({ selected, setSelected, load }) {
  const [isDirty, setIsDirty] = useState(false);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);

  const [showVariantsScreen, setShowVariantsScreen] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
    setIsDirty(true);
  };

  return (
    <>
      {/* MAIN CARD */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="
          mt-0 px-0 pt-4 pb-24 w-full
          bg-white dark:bg-gray-900
          md:mt-5 md:p-6 md:rounded-3xl
          md:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          md:bg-white/60 md:dark:bg-gray-900/60
          md:border md:border-white/40 md:dark:border-gray-700/50
          space-y-6
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
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

        {/* IMAGE + FIELDS */}
        <div
          className="
          grid grid-cols-1 md:grid-cols-[160px_1fr]
          items-start gap-6
          w-full px-0 md:px-0
        "
        >
          {/* LEFT — IMAGE */}
          <div className="flex flex-col items-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="
                w-40 h-40 md:w-44 md:h-44
                rounded-2xl overflow-hidden
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

            <label className="cursor-pointer mt-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <span
                className="
                px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700
                text-gray-800 dark:text-gray-200 text-sm
                shadow border border-gray-300 dark:border-gray-600
                hover:bg-gray-300 dark:hover:bg-gray-600 transition
              "
              >
                Chọn ảnh mới
              </span>
            </label>
          </div>

          {/* RIGHT — INFO */}
          <div className="flex-1 space-y-3 px-4 md:px-0">
            <Field
              label="SKU"
              value={selected.sku}
              onChange={(v) => {
                setSelected({ ...selected, sku: v });
                setIsDirty(true);
              }}
            />

            <Field
              label="Tên SP"
              value={selected.name}
              onChange={(v) => {
                setSelected({ ...selected, name: v });
                setIsDirty(true);
              }}
            />

            <Field
              label="Danh mục"
              value={selected.category}
              onChange={(v) => {
                setSelected({ ...selected, category: v });
                setIsDirty(true);
              }}
            />

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
                bg-indigo-600 text-white font-semibold
                shadow-md hover:bg-indigo-700 transition
                text-sm md:text-base
              "
            >
              🎨 Biến thể sản phẩm
            </button>
          </div>
        </div>

        {/* PRICE FIELDS */}
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
              if (!res.ok) throw new Error(json?.message);

              toast.success("🎉 Đã lưu thay đổi!");
              await load(selected.id);
              setIsDirty(false);
              setPreview(null);
              setImage(null);
            } catch (err) {
              toast.error("❌ " + err.message);
            }
          }}
          className="grid gap-6 px-4 md:px-0"
        >
          <div
            className="
            p-3 rounded-2xl bg-white/80 dark:bg-gray-800/70
            border shadow-md grid grid-cols-1 sm:grid-cols-2 gap-5
          "
          >
            <Field
              label="Giá nhập"
              type="number"
              value={selected.cost_price}
              onChange={(v) => {
                setSelected({ ...selected, cost_price: v });
                setIsDirty(true);
              }}
            />

            <Field
              label="Giá bán"
              type="number"
              value={selected.sale_price}
              onChange={(v) => {
                setSelected({ ...selected, sale_price: v });
                setIsDirty(true);
              }}
            />
          </div>

          {isDirty && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="submit"
              className="
                fixed md:static bottom-4 left-1/2 -translate-x-1/2
                w-[88%] md:w-auto py-3 px-7 rounded-xl
                bg-gradient-to-r from-green-500 to-green-600
                text-white font-semibold shadow-xl
              "
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
          <div
            className="
            sticky top-0 z-50 p-4
            bg-white dark:bg-gray-900 border-b
          "
          >
            <button
              onClick={() => setShowVariantsScreen(false)}
              className="text-gray-700 dark:text-gray-200"
            >
              <FiChevronLeft size={22} />
            </button>
          </div>

          <div className="p-4 pb-24">
            <ProductVariants productId={selected.id} />
          </div>
        </motion.div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        className="
          bg-gray-50 dark:bg-gray-900
          rounded-xl px-3 py-2
          border border-gray-300 dark:border-gray-700
          focus:ring-2 ring-blue-400 dark:ring-blue-500
          shadow-sm outline-none
        "
        value={value || ""}
        placeholder={label}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
