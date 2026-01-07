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

  // 🔥 Sync dữ liệu khi selected thay đổi
  useEffect(() => {
    if (selected) {
      console.log("🔍 Dữ liệu chi tiết sản phẩm:", selected);

      setForm({
        sku: selected.sku || "",
        name: selected.name || "",
        category: selected.category || "",
        brand: selected.brand || "",
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
      {/* MAIN CARD - Container chính */}
      <motion.div
        key={selected.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        // 🔥 FIX CSS: p-4 cho mobile, padding lớn hơn cho PC. min-h-full để luôn full chiều cao
        className="
          w-full min-h-full
          p-4 pb-24 md:p-6
          bg-white dark:bg-gray-900
          md:bg-transparent md:dark:bg-transparent
        "
      >
        {/* Card bao ngoài trên PC để tạo hiệu ứng nổi (trên mobile thì phẳng) */}
        <div
          className="
           md:bg-white md:dark:bg-gray-800 
           md:rounded-2xl md:shadow-sm md:border md:border-gray-200 md:dark:border-gray-700 
           md:p-6 space-y-6
        "
        >
          {/* HEADER: Chỉ hiện trên PC */}
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h4 className="font-bold text-gray-800 dark:text-white text-xl flex items-center gap-2">
              <FiEdit className="text-blue-600" /> Chi tiết sản phẩm
            </h4>
            <div className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              #{selected.id}
            </div>
          </div>

          <form
            onSubmit={submit}
            className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8"
          >
            {/* === CỘT TRÁI: QUẢN LÝ ẢNH === */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">
                  Ảnh đại diện
                </label>
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm group">
                  <img
                    src={selected.cover_image || "/no-image.png"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/no-image.png")}
                    alt="Cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-medium px-2 py-1 rounded-md bg-white/20 backdrop-blur-md">
                      Ảnh bìa hiện tại
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload ảnh mới */}
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FiUploadCloud /> Thêm ảnh mới
                </label>

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {newPreviews.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-blue-500/30"
                      >
                        <img
                          src={src}
                          className="w-full h-full object-cover"
                          alt="new"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                        >
                          <FiX size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-800 transition group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-blue-500">
                    <FiImage className="w-8 h-8 mb-2" />
                    <p className="text-xs font-medium">Click để tải ảnh</p>
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

            {/* === CỘT PHẢI: THÔNG TIN CHI TIẾT === */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              {/* Phần Giá Tiền - Highlight */}
              <div className="p-5 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-800/30 grid grid-cols-2 gap-6">
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
                  className="w-full py-3.5 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition flex items-center justify-center gap-2 group"
                >
                  🎨 Quản lý Biến thể (Size/Màu)
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 group-hover:scale-110 transition-transform">
                    PRO
                  </span>
                </button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiSave className="text-lg" /> LƯU THAY ĐỔI
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>

      {/* VARIANTS SCREEN - Full màn hình đè lên */}
      <AnimatePresence>
        {showVariantsScreen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex flex-col"
          >
            <div className="shrink-0 p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center gap-3 shadow-sm z-10">
              <button
                onClick={() => setShowVariantsScreen(false)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <FiChevronLeft size={28} />
              </button>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  Quản lý biến thể
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selected.name}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-3xl mx-auto">
                <ProductVariants productId={selected.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide group-focus-within:text-blue-500 transition-colors">
        {label}
      </label>
      <input
        type={type}
        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-800 outline-none transition-all font-medium text-gray-800 dark:text-gray-100 placeholder-gray-400"
        value={value}
        placeholder={`Nhập ${label.toLowerCase()}...`}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
