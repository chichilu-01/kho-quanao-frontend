import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiSave,
  FiX,
  FiCamera,
  FiBox,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProductForm({ load, onCancel }) {
  // --- STATE QUẢN LÝ FORM ---
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    brand: "",
    cost_price: "", // Giá nhập
    sale_price: "", // Giá bán
    stock: "",
  });

  const [image, setImage] = useState(null); // File ảnh
  const [preview, setPreview] = useState(null); // URL xem trước
  const [loading, setLoading] = useState(false);

  // --- XỬ LÝ INPUT ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- XỬ LÝ ẢNH (Single Cover Image) ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Tạo URL ảo để xem trước ngay lập tức
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  // --- GỬI FORM ---
  const submit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (!form.name || !form.sale_price) {
      return toast.error("Vui lòng nhập Tên và Giá bán!");
    }

    try {
      setLoading(true);
      const fd = new FormData();

      // Append các trường text
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));

      // Append ảnh (nếu có)
      if (image) {
        fd.append("image", image); // Backend nên xử lý field này là 'image' hoặc 'images'
      }

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

      // Reset form sau khi thành công
      setForm({
        sku: "",
        name: "",
        category: "",
        brand: "",
        cost_price: "",
        sale_price: "",
        stock: "",
      });
      setImage(null);
      setPreview(null);

      // Reload lại danh sách ở component cha
      if (load) await load(json.id);
    } catch (err) {
      console.error(err);
      toast.error("❌ " + (err?.message || "Không thể tạo sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-6"
    >
      {/* HEADER */}
      <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FiLayers className="text-blue-600" />
          Thêm sản phẩm mới
        </h2>
        {/* Nút đóng nếu cần (Optional) */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        )}
      </div>

      <form onSubmit={submit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CỘT TRÁI: ẢNH SẢN PHẨM (Chiếm 1 phần) */}
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Hình ảnh
            </label>

            <div className="relative group w-full aspect-square bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay khi hover để đổi ảnh */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white font-medium flex items-center gap-2">
                      <FiCamera /> Đổi ảnh
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-center p-4">
                  <FiCamera size={40} className="mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Bấm để tải ảnh lên</span>
                </div>
              )}

              {/* Input file ẩn */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Hỗ trợ: JPG, PNG, WEBP
            </p>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT (Chiếm 2 phần) */}
          <div className="col-span-1 md:col-span-2 space-y-5">
            {/* Hàng 1: Tên & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <FormInput
                  label="Tên sản phẩm"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="VD: Áo thun cotton..."
                  icon={<FiTag />}
                  required
                />
              </div>
              <div>
                <FormInput
                  label="Mã SKU"
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="VD: AT-01"
                />
              </div>
            </div>

            {/* Hàng 2: Giá & Kho (Group nổi bật) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="col-span-2 sm:col-span-1">
                <FormInput
                  label="Giá bán"
                  name="sale_price"
                  type="number"
                  value={form.sale_price}
                  onChange={handleChange}
                  placeholder="0"
                  icon={<FiDollarSign />}
                  className="font-bold text-blue-600 dark:text-blue-400"
                  required
                />
              </div>
              <div className="col-span-1 sm:col-span-1">
                <FormInput
                  label="Giá nhập"
                  name="cost_price"
                  type="number"
                  value={form.cost_price}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="col-span-1 sm:col-span-1">
                <FormInput
                  label="Tồn kho"
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Hàng 3: Phân loại & Thương hiệu */}
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Loại (Category)"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="VD: Áo, Quần..."
              />
              <FormInput
                label="Thương hiệu"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="VD: No Brand"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="
                px-8 py-3 rounded-xl 
                bg-blue-600 text-white font-bold 
                shadow-lg shadow-blue-200 dark:shadow-none
                hover:bg-blue-700 hover:shadow-blue-300 transition-all 
                flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>⏳ Đang xử lý...</>
            ) : (
              <>
                <FiSave /> Lưu sản phẩm
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// --- Component Input Tái Sử Dụng (Để code gọn hơn) ---
const FormInput = ({ label, icon, className = "", required, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        {...props}
        className={`
            w-full bg-white dark:bg-gray-900 
            border border-gray-200 dark:border-gray-700 rounded-lg 
            px-3 py-2.5 text-sm dark:text-white
            outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900
            transition-all placeholder:text-gray-300 
            ${icon ? "pl-9" : ""} ${className}
        `}
      />
    </div>
  </div>
);
