import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiPlusCircle, FiCheckCircle } from "react-icons/fi";

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
      if (!res.ok) throw new Error(json?.message || "Tạo sản phẩm thất bại");

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
    <>
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
        <FiPlusCircle className="text-blue-500" /> Thêm sản phẩm mới
      </h3>

      <form onSubmit={submit} className="grid gap-3">
        {["sku", "name", "category", "brand"].map((key) => (
          <input
            key={key}
            className="input dark:bg-gray-800"
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

        <div className="grid grid-cols-3 gap-2">
          {["cost_price", "sale_price", "stock"].map((key) => (
            <input
              key={key}
              type="number"
              className="input dark:bg-gray-800"
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

        <label className="text-sm text-gray-600 dark:text-gray-300">
          Ảnh sản phẩm
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="input dark:bg-gray-800"
        />
        {preview && (
          <motion.img
            src={preview}
            alt="preview"
            className="w-32 h-32 object-cover rounded-xl border shadow mx-auto"
          />
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="btn-primary w-full mt-2 py-2 rounded-lg font-semibold"
        >
          {loading ? "⏳ Đang lưu..." : "💾 Lưu sản phẩm"}
        </motion.button>
      </form>
    </>
  );
}
