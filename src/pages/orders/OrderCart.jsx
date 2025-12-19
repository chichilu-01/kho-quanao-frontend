// src/pages/orders/OrderCart.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FiShoppingCart,
  FiTrash2,
  FiCheckCircle,
  FiTruck,
} from "react-icons/fi";
import { notify } from "../../hooks/useToastNotify";
import { api } from "../../api/client"; // ✅ Đã sửa: Import API client

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
  // ✅ Mới: State lưu mã vận đơn Trung Quốc
  const [trackingCode, setTrackingCode] = useState("");

  // ===========================
  // UPDATE QTY
  // ===========================
  const updateQty = (idx, qty) => {
    setItems((prev) => {
      const clone = [...prev];
      qty = Math.max(1, Number(qty || 1));

      // Check tồn kho
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

  // ===========================
  // SUBMIT ORDER
  // ===========================
  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);

    let finalCustomerId = customerId;

    try {
      // 1. Tạo khách hàng mới nếu cần
      if (isNewCustomer) {
        // ✅ SỬA LẠI CÚ PHÁP ĐÚNG
        const created = await api("/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCustomer),
        });
        finalCustomerId = created.id;
      }

      // 2. Chuẩn bị payload gửi lên Server
      const payload = {
        customer_id: Number(finalCustomerId),
        note,
        china_tracking_code: trackingCode, // ✅ Gửi mã vận đơn lên server
        items: items.map((it) => ({
          variant_id: it.variant_id,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      // 3. Gọi API tạo đơn
      // ✅ SỬA LẠI CÚ PHÁP ĐÚNG
      const res = await api("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 4. Update lại variants nếu đang chọn sản phẩm đó
      if (selectedProductId) await loadVariants(selectedProductId);

      // 5. Hiển thị thông báo thành công
      setCreatedOrder({
        id: res.id,
        customer:
          isNewCustomer || !customerId
            ? newCustomer
            : customers.find((c) => String(c.id) === String(customerId)),
        total,
        note,
        items,
        china_tracking_code: trackingCode,
      });

      // 6. Reset form
      setItems([]);
      setNote("");
      setTrackingCode(""); // Reset mã vận đơn

      notify.success(`✅ Đơn hàng #${res.id} đã được tạo thành công!`);
    } catch (err) {
      console.error(err);
      notify.error("❌ Lỗi khi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // PRINT PDF
  // ===========================
  const printInvoice = () => {
    if (!createdOrder) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("HÓA ĐƠN BÁN HÀNG", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Mã đơn: #${createdOrder.id}`, 14, 30);
    doc.text(`Khách hàng: ${createdOrder.customer?.name}`, 14, 36);
    if (createdOrder.china_tracking_code) {
      doc.text(`Mã vận đơn TQ: ${createdOrder.china_tracking_code}`, 14, 42);
    }

    const rows = createdOrder.items.map((it, i) => [
      i + 1,
      it.product_name,
      `${it.size || "-"}/${it.color || "-"}`,
      it.quantity,
      money(it.price),
      money(it.price * it.quantity),
    ]);

    doc.autoTable({
      startY: 50,
      head: [["#", "Sản phẩm", "Phân loại", "SL", "Giá", "Thành tiền"]],
      body: rows,
      theme: "grid",
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.text(
      `Tổng cộng: ${money(createdOrder.total)}`,
      140,
      doc.lastAutoTable.finalY + 10,
    );

    doc.save(`HoaDon_${createdOrder.id}.pdf`);
  };

  // ===========================================================
  // ⭐ MOBILE FULLSCREEN BOTTOM SHEET CONTAINER
  // ===========================================================
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 40 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-md flex flex-col
        ${
          isMobile
            ? "fixed left-0 right-0 bottom-0 top-[70px] z-40 p-4 overflow-hidden"
            : "p-6"
        }
      `}
      style={{
        height: isMobile ? "100vh" : "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* MOBILE DRAG HANDLE */}
      {isMobile && (
        <div className="w-12 h-1.5 bg-gray-400/50 rounded-full mx-auto mb-3 flex-shrink-0"></div>
      )}

      {/* STICKY HEADER */}
      <div className="flex-shrink-0 pb-3 border-b mb-2">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-700">
          <FiShoppingCart className="text-green-600" /> Giỏ hàng
        </h3>
      </div>

      {/* =================== */}
      {/* SCROLLABLE CONTENT */}
      {/* =================== */}
      <div className="flex-1 overflow-y-auto pr-1">
        {/* LIST ITEMS */}
        {items.length === 0 ? (
          <div className="text-gray-500 italic text-center py-10 text-lg border-2 border-dashed rounded-xl">
            🛒 Chưa có sản phẩm nào
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 text-left">SP</th>
                  <th className="p-2 w-16 text-center">SL</th>
                  <th className="p-2 w-24 text-right hidden sm:table-cell">
                    Giá
                  </th>
                  <th className="p-2 w-24 text-right">Tổng</th>
                  <th className="p-2 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{it.product_name}</div>
                      <div className="text-xs text-gray-500">
                        {it.size} / {it.color}
                      </div>
                      {/* Mobile hiện giá ở đây */}
                      <div className="sm:hidden text-xs text-blue-600">
                        {money(it.price)}
                      </div>
                    </td>

                    {/* SL Control */}
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateQty(idx, it.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateQty(idx, e.target.value)}
                          className="w-8 text-center border rounded text-xs p-1"
                        />
                        <button
                          onClick={() => {
                            if (it.quantity >= it.stock)
                              return notify.info("Hết hàng tồn");
                            updateQty(idx, it.quantity + 1);
                          }}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Giá (PC) */}
                    <td className="p-2 text-right hidden sm:table-cell">
                      <input
                        type="number"
                        className="w-20 text-right border rounded p-1 text-xs"
                        value={it.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setItems((prev) => {
                            const clone = [...prev];
                            clone[idx].price = val;
                            return clone;
                          });
                        }}
                      />
                    </td>

                    {/* Thành tiền */}
                    <td className="p-2 text-right font-semibold text-green-700">
                      {money(it.price * it.quantity)}
                    </td>

                    {/* Xóa */}
                    <td className="p-2 text-right">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
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

        {/* TOTAL */}
        <div className="text-right font-bold text-lg mt-4 text-gray-800">
          Tổng cộng: <span className="text-green-700">{money(total)}</span>
        </div>

        {/* ========================= */}
        {/* 🆕 NHẬP MÃ VẬN ĐƠN */}
        {/* ========================= */}
        <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <label className="text-xs font-bold text-yellow-800 flex items-center gap-1 mb-1 uppercase tracking-wide">
            <FiTruck /> Mã Vận Đơn Trung Quốc (Tùy chọn)
          </label>
          <input
            className="w-full bg-white border border-yellow-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-yellow-500 placeholder-yellow-300 text-yellow-900"
            placeholder="Paste mã tracking vào đây (VD: YT2025...)"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
          />
        </div>

        {/* NOTE */}
        <textarea
          className="w-full border rounded-lg p-3 mt-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={2}
          placeholder="📝 Ghi chú đơn hàng..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* Spacer for mobile bottom */}
        <div className="h-20 sm:h-0"></div>
      </div>

      {/* ========================= */}
      {/* FOOTER ACTIONS */}
      {/* ========================= */}
      <div className="mt-auto pt-3 border-t bg-white sticky bottom-0">
        <button
          className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
            canSubmit
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          onClick={submit}
          disabled={!canSubmit}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Đang tạo đơn...
            </>
          ) : (
            <>✅ Tạo đơn hàng</>
          )}
        </button>
      </div>

      {/* SUCCESS MODAL / BOX */}
      <AnimatePresence>
        {createdOrder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 rounded-2xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="text-green-600 text-4xl" />
            </div>

            <h3 className="font-bold text-2xl text-green-700 mb-2 text-center">
              Tạo đơn thành công!
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl w-full mb-6 border border-gray-100">
              <p className="text-gray-600 text-sm">
                Mã đơn: <b className="text-black">#{createdOrder.id}</b>
              </p>
              <p className="text-gray-600 text-sm">
                Khách:{" "}
                <b className="text-black">{createdOrder.customer?.name}</b>
              </p>
              {createdOrder.china_tracking_code && (
                <p className="text-gray-600 text-sm">
                  Mã vận đơn:{" "}
                  <b className="text-yellow-700 bg-yellow-100 px-1 rounded">
                    {createdOrder.china_tracking_code}
                  </b>
                </p>
              )}
              <div className="border-t border-dashed my-2"></div>
              <p className="text-right font-bold text-lg text-green-700">
                {money(createdOrder.total)}
              </p>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setCreatedOrder(null)} // Đóng modal để tạo đơn mới
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
              >
                Tạo đơn mới
              </button>
              <button
                onClick={printInvoice}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                In hóa đơn
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
