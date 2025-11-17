// src/pages/orders/OrderCart.jsx
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FiShoppingCart, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";

const money = (v) =>
  Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

export default function OrderCart({
  items,
  setItems,
  note,
  setNote,
  customerId,
  customers,
  isNewCustomer,
  newCustomer,
  createdOrder,
  setCreatedOrder,
  loading,
  setLoading,
  loadVariants,
  selectedProductId,
}) {
  const updateQty = (idx, qty) => {
    setItems((prev) => {
      const clone = [...prev];
      qty = Math.max(1, Number(qty || 1));
      if (qty > clone[idx].stock) {
        notify.info(`⚠️ Chỉ còn ${clone[idx].stock} sản phẩm tồn kho`);
        return prev;
      }
      clone[idx].quantity = qty;
      return clone;
    });
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);

  const canSubmit =
    !loading &&
    items.length > 0 &&
    (!!customerId || (isNewCustomer && newCustomer.name?.trim()));

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    let finalCustomerId = customerId;
    try {
      if (isNewCustomer) {
        const created = await api("/customers", {
          method: "POST",
          body: JSON.stringify(newCustomer),
        });
        finalCustomerId = created.id;
      }

      const payload = {
        customer_id: Number(finalCustomerId),
        note,
        items: items.map((it) => ({
          variant_id: it.variant_id,
          quantity: it.quantity,
          price: it.price,
        })),
      };
      const res = await api("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (selectedProductId) await loadVariants(selectedProductId);

      setCreatedOrder({
        id: res.id,
        customer:
          isNewCustomer || !customerId
            ? newCustomer
            : customers.find((c) => String(c.id) === String(customerId)),
        total,
        note,
        items,
      });

      setItems([]);
      setNote("");
      notify.success(`✅ Đơn hàng #${res.id} đã được tạo thành công!`);
    } catch {
      notify.error("❌ Lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    if (!createdOrder) return;
    const doc = new jsPDF();
    doc.text("HÓA ĐƠN BÁN HÀNG", 105, 20, { align: "center" });
    const rows = createdOrder.items.map((it, i) => [
      i + 1,
      it.product_name,
      `${it.size}/${it.color}`,
      it.quantity,
      money(it.price),
      money(it.price * it.quantity),
    ]);
    doc.autoTable({
      startY: 30,
      head: [["#", "Sản phẩm", "Phân loại", "SL", "Giá", "Thành tiền"]],
      body: rows,
    });
    doc.text(
      `Tổng cộng: ${money(createdOrder.total)}`,
      150,
      doc.lastAutoTable.finalY + 10,
    );
    doc.save(`HoaDon_${createdOrder.id}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border shadow-md"
    >
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-700">
        <FiShoppingCart className="text-green-600" /> Giỏ hàng
      </h3>

      {items.length === 0 ? (
        <div className="text-gray-500 italic text-center py-12">
          🛒 Chưa có sản phẩm nào
        </div>
      ) : (
        <div className="overflow-auto max-h-[380px] border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr className="text-left">
                <th className="p-2">Sản phẩm</th>
                <th className="p-2 w-28">SL</th>
                <th className="p-2 w-24">Giá</th>
                <th className="p-2 w-28 text-right">Thành tiền</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>

            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{it.product_name}</td>

                  {/* ---------------------------- */}
                  {/* 🔥 KHỐI SỐ LƯỢNG NÂNG CẤP PRO */}
                  {/* ---------------------------- */}
                  <td className="p-2">
                    <div className="flex items-center gap-2 justify-center">
                      {/* – BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(idx, it.quantity - 1);
                        }}
                        className="qty-btn"
                      >
                        –
                      </button>

                      {/* INPUT */}
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        value={it.quantity}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateQty(idx, Number(e.target.value))}
                        className="qty-input qty-bounce"
                      />

                      {/* + BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (it.quantity + 1 > it.stock) {
                            notify.info(
                              `⚠️ Chỉ còn ${it.stock} sản phẩm tồn kho`,
                            );
                            return;
                          }
                          updateQty(idx, it.quantity + 1);
                        }}
                        className={`qty-btn ${it.quantity >= it.stock ? "qty-btn-disabled" : ""}`}
                        disabled={it.quantity >= it.stock}
                      >
                        +
                      </button>
                    </div>
                  </td>

                  {/* GIÁ */}
                  <td className="p-2">
                    <input
                      type="number"
                      value={it.price}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value || 0));
                        setItems((prev) => {
                          const clone = [...prev];
                          clone[idx].price = val;
                          return clone;
                        });
                      }}
                      className="input w-20"
                    />
                  </td>

                  {/* THÀNH TIỀN */}
                  <td className="p-2 text-right font-semibold text-green-700">
                    {money(it.price * it.quantity)}
                  </td>

                  <td className="p-2 text-right">
                    <button
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-right font-bold text-lg mt-4 text-gray-800">
        Tổng cộng: <span className="text-green-700">{money(total)}</span>
      </div>

      <textarea
        className="input w-full mt-3"
        rows={2}
        placeholder="📝 Ghi chú đơn hàng (nếu có)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button
        className={`btn w-full mt-4 text-white font-semibold rounded-lg transition ${
          canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
        }`}
        onClick={submit}
        disabled={!canSubmit}
      >
        {loading ? "⏳ Đang tạo đơn..." : "✅ Tạo đơn hàng"}
      </button>

      <AnimatePresence>
        {createdOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-300 rounded-xl p-5 mt-6 shadow-inner"
          >
            <h3 className="font-semibold text-lg mb-2 text-green-700 flex items-center gap-2">
              <FiCheckCircle /> Đơn hàng đã tạo thành công!
            </h3>

            <p>
              Mã đơn hàng: <b>#{createdOrder.id}</b>
            </p>
            <p>
              Khách hàng: <b>{createdOrder.customer?.name}</b>
            </p>
            <p>Tổng tiền: {money(createdOrder.total)}</p>

            <button
              onClick={printInvoice}
              className="btn mt-3 bg-blue-600 text-white hover:bg-blue-700 w-full rounded-lg"
            >
              🧾 In hóa đơn PDF
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
