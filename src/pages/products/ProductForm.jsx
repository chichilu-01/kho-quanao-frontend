import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlusCircle, FiCheckCircle, FiImage, FiX } from "react-icons/fi";

export default function ProductForm({ load }) {
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    cost_price: "",
    sale_price: "",
    stock: "",
  });

  // ⭐ NEW: nhiều ảnh
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- Chọn nhiều ảnh ----
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // ---- Xóa 1 ảnh ----
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();

      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));

      // ⭐ Gửi tất cả ảnh
      images.forEach((img) => fd.append("images", img));

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/products`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message);

      toast.success(
        <span className="flex items-center gap-2">
          <FiCheckCircle /> Tạo sản phẩm thành công!
        </span>,
      );

      // Reset form
      setForm({
        sku: "",
        name: "",
        category: "",
        brand: "",
        cost_price: "",
        sale_price: "",
        stock: "",
      });
      setImages([]);
      setPreviews([]);

      await load(json.id);
    } catch (err) {
      toast.error("❌ " + (err?.message || "Không thể tạo sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-4">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <FiPlusCircle className="text-blue-500" /> Thêm sản phẩm mới
      </h3>

      <form
        onSubmit={submit}
        className="
          p-4 rounded-xl 
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          shadow-sm space-y-4
        "
      >
        {/* ---- Thông tin cơ bản ---- */}
        <div className="grid grid-cols-1 gap-3">
          {["sku", "name", "category", "brand"].map((key) => (
            <input
              key={key}
              className="input dark:bg-gray-900 py-3 rounded-lg text-sm"
              placeholder={
                key === "sku"
                  ? "Mã sản phẩm (SKU)"
                  : key === "name"
                    ? "Tên sản phẩm"
                    : key === "category"
                      ? "Loại (Áo, Quần…)"
                      : "Thương hiệu"
              }
              required={["sku", "name"].includes(key)}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>

        {/* ---- Giá & Tồn kho ---- */}
        <div className="grid grid-cols-3 gap-2">
          {["cost_price", "sale_price", "stock"].map((key) => (
            <input
              key={key}
              type="number"
              className="input dark:bg-gray-900 py-3 rounded-lg text-sm"
              placeholder={
                key === "cost_price"
                  ? "Giá nhập"
                  : key === "sale_price"
                    ? "Giá bán"
                    : "Tồn kho"
              }
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          ))}
        </div>

        {/* ---- Upload nhiều ảnh ---- */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <FiImage /> Ảnh sản phẩm
          </label>

          {/* Grid preview */}
          <div
            className="
              grid grid-cols-3 gap-3 
              border border-dashed rounded-xl p-3 
              bg-gray-50 dark:bg-gray-900
            "
          >
            {previews.length === 0 && (
              <span className="text-gray-400 text-sm col-span-3 text-center">
                Chưa chọn ảnh
              </span>
            )}

            {previews.map((src, index) => (
              <div key={index} className="relative group">
                <img
                  src={src}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg shadow"
                />
                {/* Nút xoá */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="
                    absolute top-1 right-1 
                    bg-black/60 text-white p-1 rounded-full opacity-0 
                    group-hover:opacity-100 transition
                  "
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Input multiple */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="input dark:bg-gray-900 mt-1 py-2 rounded-lg text-sm"
          />
        </div>

        {/* ---- Nút Lưu ---- */}
        <div className="pt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            type="submit"
            className="
              w-full mt-4 py-3 rounded-xl 
              bg-gradient-to-r from-blue-500 to-blue-600 
              text-white font-semibold shadow-lg text-sm
            "
          >
            {loading ? "⏳ Đang tạo..." : "💾 Lưu sản phẩm"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
