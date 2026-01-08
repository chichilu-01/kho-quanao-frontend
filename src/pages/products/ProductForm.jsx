import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiSave,
  FiX,
  FiCamera,
  FiDollarSign,
  FiTag,
  FiLayers,
  FiCheckCircle,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

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
    if (!form.name) {
      return toast.error("Vui lòng nhập Tên sản phẩm!");
    }

    try {
      setLoading(true);
      const fd = new FormData();

      // --- 🔥 FIX QUAN TRỌNG: Đảm bảo gửi số đúng định dạng ---
      fd.append("name", form.name);
      fd.append("sku", form.sku);
      fd.append("category", form.category);
      fd.append("brand", form.brand);

      // Nếu rỗng thì gửi 0, ép kiểu Number để an toàn
      fd.append("cost_price", Number(form.cost_price) || 0);
      fd.append("sale_price", Number(form.sale_price) || 0);
      fd.append("stock", Number(form.stock) || 0);

      // Append ảnh (nếu có)
      if (image) {
        fd.append("image", image);
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Lỗi server");

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

      // Reload lại danh sách ở component cha (Products.js)
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
      // 🔥 FIX CSS: Mobile phẳng (w-full), PC bo góc (md:rounded...)
      className="
        w-full bg-white dark:bg-gray-800 
        overflow-hidden
        md:rounded-2xl md:shadow-xl md:border md:border-gray-100 md:dark:border-gray-700 md:mb-6
      "
    >
      {/* HEADER: Ẩn trên Mobile (hidden), Hiện trên PC (md:flex) */}
      <div className="hidden md:flex bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-700 justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <FiLayers className="text-blue-600" />
          Thêm sản phẩm mới
        </h2>
        {/* Nút đóng */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        )}
      </div>

      <form onSubmit={submit} className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
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

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
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

            {/* Hàng 2: Giá & Kho */}
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

            {/* Hàng 3: Phân loại */}
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
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold transition"
            >
              Hủy bỏ
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="
                w-full md:w-auto px-8 py-3 rounded-xl 
                bg-blue-600 text-white font-bold 
                shadow-lg shadow-blue-200 dark:shadow-none
                hover:bg-blue-700 hover:shadow-blue-300 transition-all 
                flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
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

// Component Input Tái Sử Dụng
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