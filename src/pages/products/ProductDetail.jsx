import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiEdit,
  FiSave,
  FiChevronLeft,
  FiImage,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";
import ProductVariants from "../../components/products/ProductVariants";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function ProductDetail({ selected, setSelected, load }) {
  // State quản lý form
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    cost_price: "",
    sale_price: "",
  });

  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVariantsScreen, setShowVariantsScreen] = useState(false);

  // 🔥 FIX LỖI 0đ: Sync dữ liệu thông minh hơn
  useEffect(() => {
    if (selected) {
      console.log("🔍 Dữ liệu chi tiết sản phẩm:", selected);

      setForm({
        sku: selected.sku || "",
        name: selected.name || "",
        category: selected.category || "",
        brand: selected.brand || "",

        // Kiểm tra nhiều trường hợp tên biến giá tiền
        cost_price:
          selected.cost_price ||
          selected.import_price ||
          selected.original_price ||
          0,

        sale_price:
          selected.sale_price || selected.price || selected.retail_price || 0,
      });

      setNewImages([]);
      setNewPreviews([]);
    }
  }, [selected]);

  // --- Xử lý chọn nhiều ảnh ---
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previewUrls]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Gửi dữ liệu ---
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      // Append thông tin chữ
      Object.entries(form).forEach(([key, value]) => {
        fd.append(key, value);
      });

      // Append file ảnh
      newImages.forEach((img) => {
        fd.append("images", img);
      });

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/products/${selected.id}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Lỗi khi cập nhật");

      toast.success("🎉 Đã cập nhật sản phẩm!");

      // Load lại dữ liệu
      await load(selected.id);

      // Reset ảnh
      setNewImages([]);
      setNewPreviews([]);
    } catch (err) {
      console.error(err);
      toast.error("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selected) return null;

  return (
    <>
      {/* MAIN CARD */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        // 🔥 FIX CSS: Mobile (px-4, full width), PC (rounded, shadow)
        className="
          mt-0 px-4 pt-4 pb-24 w-full
          bg-white dark:bg-gray-900
          md:mt-5 md:p-6 md:rounded-3xl
          md:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          md:bg-white/60 md:dark:bg-gray-900/60
          md:border md:border-white/40 md:dark:border-gray-700/50
          space-y-6
        "
      >
        {/* HEADER: Chỉ hiện trên PC (md:flex), Mobile ẩn vì có sticky header ngoài */}
        <div className="hidden md:flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-50 text-xl flex items-center gap-2">
            <FiEdit className="text-blue-500" /> Chi tiết sản phẩm
          </h4>
          <div className="text-xs text-gray-400">ID: #{selected.id}</div>
        </div>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8"
        >
          {/* CỘT TRÁI: ẢNH */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                Ảnh đại diện hiện tại
              </label>
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                <img
                  src={selected.cover_image || "/no-image.png"}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.src = "/no-image.png")}
                  alt="Cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium px-2 py-1 rounded bg-black/50">
                    Ảnh gốc
                  </span>
                </div>
              </div>
            </div>

            {/* Upload ảnh mới */}
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FiUploadCloud /> Thêm ảnh mới / Thay thế
              </label>

              {newPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {newPreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden border border-blue-200"
                    >
                      <img
                        src={src}
                        className="w-full h-full object-cover"
                        alt="new"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                  <FiImage className="w-6 h-6 mb-1" />
                  <p className="text-xs">Chọn nhiều ảnh</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                />
              </label>
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Tên sản phẩm"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <Field
                label="Mã SKU"
                value={form.sku}
                onChange={(v) => setForm({ ...form, sku: v })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Danh mục"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
              />
              <Field
                label="Thương hiệu"
                value={form.brand}
                onChange={(v) => setForm({ ...form, brand: v })}
              />
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 grid grid-cols-2 gap-6">
              <Field
                label="Giá nhập (Vốn)"
                type="number"
                value={form.cost_price}
                onChange={(v) => setForm({ ...form, cost_price: v })}
              />
              <Field
                label="Giá bán (Lẻ)"
                type="number"
                value={form.sale_price}
                onChange={(v) => setForm({ ...form, sale_price: v })}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowVariantsScreen(true)}
                className="w-full py-3 rounded-xl border-2 border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition flex items-center justify-center gap-2"
              >
                🎨 Quản lý Biến thể (Size/Màu)
              </button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  "⏳ Đang lưu..."
                ) : (
                  <>
                    <FiSave /> Lưu thay đổi
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* VARIANTS SCREEN */}
      {showVariantsScreen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
        >
          <div className="sticky top-0 z-50 p-4 bg-white dark:bg-gray-900 border-b flex items-center gap-2">
            <button
              onClick={() => setShowVariantsScreen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <FiChevronLeft size={24} />
            </button>
            <h3 className="font-bold text-lg">
              Quản lý biến thể: {selected.name}
            </h3>
          </div>
          <div className="p-4 pb-24 max-w-5xl mx-auto">
            <ProductVariants productId={selected.id} />
          </div>
        </motion.div>
      )}
    </>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition font-medium text-gray-800 dark:text-gray-100"
        value={value}
        placeholder={label}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
