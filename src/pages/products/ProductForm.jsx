import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlusCircle, FiCheckCircle, FiImage } from "react-icons/fi";

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

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImage(file || null);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ""));
      if (image) fd.append("image", image);

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

      await load(json.id);
    } catch (err) {
      toast.error("❌ " + (err?.message || "Không thể tạo sản phẩm"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pb-24">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <FiPlusCircle className="text-blue-500" /> Thêm sản phẩm mới
      </h3>

      {/* CARD FORM */}
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
              className="
                input dark:bg-gray-900 
                py-3 rounded-lg text-sm
              "
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
              className="
                input dark:bg-gray-900 
                py-3 rounded-lg text-sm
              "
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

        {/* ---- Upload ảnh ---- */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
            <FiImage /> Ảnh sản phẩm
          </label>

          <div
            className="
              flex items-center justify-center 
              h-40 border border-dashed rounded-xl shadow-sm 
              bg-gray-50 dark:bg-gray-900
            "
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-gray-400 text-sm">Chưa chọn ảnh</span>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="
              input dark:bg-gray-900 mt-1 
              py-2 rounded-lg text-sm
            "
          />
        </div>

        {/* SPACER để chừa chỗ cho nút sticky */}
        <div className="h-4"></div>
      </form>

      {/* ---- Nút Lưu dính đáy ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t dark:border-gray-700">
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          type="submit"
          form="product-form-id"
          onClick={submit}
          className="
            w-full py-3 rounded-xl 
            bg-gradient-to-r from-blue-500 to-blue-600 
            text-white font-semibold shadow-lg text-sm
          "
        >
          {loading ? "⏳ Đang tạo..." : "💾 Lưu sản phẩm"}
        </motion.button>
      </div>
    </div>
  );
}
