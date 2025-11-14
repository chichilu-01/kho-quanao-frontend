import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import { api } from "../../api/client";

export function RestockModal({ open, setOpen, product, qty, setQty, reload }) {
  if (!open) return null;

  const confirmRestock = async () => {
    if (!qty || Number(qty) <= 0) {
      toast("⚠️ Nhập số lượng hợp lệ!");
      return;
    }
    try {
      await api("/stock/import", {
        method: "POST",
        body: JSON.stringify({
          product_id: product.id,
          quantity: Number(qty),
        }),
      });
      toast.success(`✅ Đã nhập thêm ${qty} sp cho “${product.name}”`);
      setOpen(false);
      await reload(product.id);
    } catch (err) {
      toast.error("❌ " + (err?.message || "Lỗi nhập hàng"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl w-full max-w-sm space-y-3">
        <h4 className="font-semibold">Nhập thêm hàng: {product?.name}</h4>
        <input
          type="number"
          className="input dark:bg-gray-700"
          placeholder="Số lượng"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setOpen(false)}>
            Hủy
          </button>
          <button onClick={confirmRestock} className="btn-primary">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteModal({
  open,
  setOpen,
  selected,
  reload,
  clearSelected,
}) {
  if (!open || !selected) return null;

  const doDelete = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE}/products/${selected.id}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Xoá thất bại");
      toast.success("🗑️ Đã ẩn sản phẩm khỏi danh sách");
      setOpen(false);
      clearSelected();
      await reload();
    } catch (err) {
      toast.error("❌ " + (err?.message || "Không thể xoá"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl w-full max-w-sm space-y-3">
        <h4 className="font-semibold text-red-600 flex items-center gap-2">
          <FiTrash2 /> Ẩn sản phẩm
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Bạn có chắc muốn ẩn <b>{selected.name}</b> khỏi danh sách?
        </p>
        <div className="flex justify-end gap-2">
          <button className="btn-outline" onClick={() => setOpen(false)}>
            Hủy
          </button>
          <button
            onClick={doDelete}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
