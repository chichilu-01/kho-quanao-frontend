import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FiShoppingCart,
  FiTrash2,
  FiCheckCircle,
  FiTruck,
  FiUser,
  FiMapPin,
} from "react-icons/fi";
import { notify } from "../../hooks/useToastNotify";

// ✅ API Config
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Helper: Format tiền tệ hiển thị
const money = (v) =>
  Number(v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

// Helper: Format số khi nhập (có dấu chấm phân cách)
const formatNumberInput = (val) => {
  if (!val) return "";
  return Number(val).toLocaleString("vi-VN");
};

export default function OrderCart({
  items,
  setItems,
  deposit,
  setDeposit,
  note,
  setNote,
  customerId,
  customers,
  isNewCustomer,
  newCustomer,
  setNewCustomer,
  createdOrder,
  setCreatedOrder,
  loading,
  setLoading,
  loadVariants,
  selectedProductId,
}) {
  const [trackingCode, setTrackingCode] = useState("");

  // Sửa lỗi Mobile: Dùng State để lắng nghe thay đổi kích thước màn hình
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check ngay lần đầu
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ===========================
  // ✅ FIX: UPDATE QTY (IMMUTABLE)
  // ===========================
  const updateQty = (idx, qty) => {
    setItems((prev) => {
      const newQty = Math.max(1, Number(qty || 1));
      // Tạo mảng mới
      const newItems = [...prev];
      // Quan trọng: Phải tạo object mới cho phần tử bị thay đổi
      newItems[idx] = { ...newItems[idx], quantity: newQty };
      return newItems;
    });
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  // Ép kiểu an toàn cho deposit để tránh lỗi NaN
  const safeDeposit = Number(String(deposit).replace(/\./g, "")) || 0;
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const remaining = subtotal - safeDeposit;

  const canSubmit =
    !loading &&
    items.length > 0 &&
    (!!customerId || (isNewCustomer && newCustomer.name?.trim()));

  // ===========================
  // ⭐ SUBMIT ORDER
  // ===========================
  const submit = async () => {
    if (!canSubmit) return;

    if (isNewCustomer && (!newCustomer.name || !newCustomer.phone)) {
      return notify.error("Vui lòng nhập tên và SĐT khách hàng!");
    }

    setLoading(true);

    let finalCustomerId = customerId;
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    try {
      // 1. Create new customer if needed
      if (isNewCustomer) {
        const resCus = await fetch(`${API_BASE}/customers`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(newCustomer),
        });

        const jsonCus = await resCus.json();
        if (!resCus.ok)
          throw new Error(jsonCus.message || "Lỗi tạo khách hàng");

        finalCustomerId = jsonCus.id;
      }

      // 2. Prepare payload
      const payload = {
        customer_id: Number(finalCustomerId),
        note,
        china_tracking_code: trackingCode,
        deposit: safeDeposit, // Dùng số đã làm sạch
        items: items.map((it) => ({
          variant_id: it.variant_id || null,
          quantity: it.quantity,
          price: it.price,
        })),
      };

      // 3. Create Order
      const resOrder = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const jsonOrder = await resOrder.json();
      if (!resOrder.ok)
        throw new Error(jsonOrder.message || "Lỗi tạo đơn hàng");

      // 4. Update variants (Kiểm tra an toàn trước khi gọi)
      if (selectedProductId && typeof loadVariants === "function") {
        await loadVariants(selectedProductId);
      }

      // 5. Success
      setCreatedOrder({
        id: jsonOrder.id,
        customer:
          isNewCustomer || !customerId
            ? newCustomer
            : customers.find((c) => String(c.id) === String(customerId)),
        total: subtotal,
        deposit: safeDeposit,
        note,
        items,
        china_tracking_code: trackingCode,
      });

      setItems([]);
      setNote("");
      setTrackingCode("");
      setDeposit(""); // Reset về chuỗi rỗng

      notify.success(`✅ Đơn hàng #${jsonOrder.id} đã được tạo thành công!`);
    } catch (err) {
      console.error(err);
      notify.error("❌ " + (err.message || "Lỗi khi tạo đơn hàng"));
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
    // Font setup (Lưu ý: jsPDF mặc định không hỗ trợ tiếng Việt có dấu tốt trừ khi add font custom)
    // Code dưới đây dùng font mặc định nên có thể lỗi hiển thị tiếng Việt.

    doc.setFontSize(18);
    doc.text("HOA DON BAN HANG", 105, 20, { align: "center" }); // Dùng không dấu để an toàn

    doc.setFontSize(12);
    doc.text(`Ma don: #${createdOrder.id}`, 14, 30);
    const cusName = createdOrder.customer?.name || "Khach le";
    doc.text(`Khach hang: ${cusName}`, 14, 36);
    doc.text(`SDT: ${createdOrder.customer?.phone || ""}`, 14, 42);

    const rows = createdOrder.items.map((it, i) => [
      i + 1,
      it.product_name, // Nếu tên SP có dấu tiếng Việt có thể bị lỗi font
      `${it.size || "-"}/${it.color || "-"}`,
      it.quantity,
      money(it.price),
      money(it.price * it.quantity),
    ]);

    doc.autoTable({
      startY: 55,
      head: [["#", "San pham", "Phan loai", "SL", "Gia", "Thanh tien"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Tong tien: ${money(createdOrder.total)}`, 140, finalY);
    doc.text(`Da coc: ${money(createdOrder.deposit)}`, 140, finalY + 6);
    doc.setFont(undefined, "bold");
    doc.text(
      `CON LAI: ${money(createdOrder.total - (createdOrder.deposit || 0))}`,
      140,
      finalY + 14,
    );

    doc.save(`HoaDon_${createdOrder.id}.pdf`);
  };

  const existingCustomer = customers.find((c) => c.id === Number(customerId));

  return (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 40 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-md flex flex-col
        ${
          isMobile
            ? // 👇 THAY ĐỔI Ở ĐÂY:
              // 1. Đổi bottom-0 thành bottom-[60px] (hoặc 70px/80px tùy chiều cao menu)
              // 2. Thêm z-40 để đè lên content nền nhưng không che menu (nếu menu là z-50)
              "fixed left-0 right-0 bottom-[60px] top-[70px] z-40 p-4 overflow-hidden"
            : "p-6"
        }
      `}
      style={{
        // 👇 THAY ĐỔI Ở ĐÂY:
        // Cập nhật lại chiều cao: 100vh - (top 70px + bottom 60px) = 130px
        height: isMobile ? "calc(100vh - 130px)" : "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ... Phần Header và Customer giữ nguyên ... */}

      {/* HEADER GIỎ HÀNG */}
      <div className="flex-shrink-0 pb-3 border-b mb-2">
        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-700">
          <FiShoppingCart className="text-green-600" /> Giỏ hàng ({items.length}
          )
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {/* 1. CUSTOMER INFO SECTION */}
        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase mb-2">
            <FiUser /> Thông tin nhận hàng
          </div>

          {isNewCustomer ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    placeholder="Tên khách hàng"
                    className="w-full bg-white border border-blue-200 rounded px-2 py-1.5 text-sm focus:outline-blue-500"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <input
                    placeholder="SĐT"
                    className="w-full bg-white border border-blue-200 rounded px-2 py-1.5 text-sm focus:outline-blue-500"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="relative">
                <FiMapPin
                  className="absolute top-2 left-2 text-gray-400"
                  size={14}
                />
                <input
                  placeholder="Địa chỉ giao hàng"
                  className="w-full bg-white border border-blue-200 rounded pl-7 pr-2 py-1.5 text-sm focus:outline-blue-500"
                  value={newCustomer.address}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, address: e.target.value })
                  }
                />
              </div>
            </div>
          ) : existingCustomer ? (
            <div className="text-sm">
              <div className="font-bold text-gray-800">
                {existingCustomer.name}{" "}
                <span className="font-normal text-gray-500">
                  - {existingCustomer.phone}
                </span>
              </div>
              <div className="text-gray-500 truncate">
                {existingCustomer.address || "Chưa có địa chỉ"}
              </div>
            </div>
          ) : (
            <div className="text-sm text-red-500 italic">
              Chưa chọn khách hàng
            </div>
          )}
        </div>

        {/* 2. CART ITEMS */}
        {items.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8 text-sm border-2 border-dashed rounded-xl">
            🛒 Giỏ hàng trống
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="flex gap-3 bg-white border rounded-xl p-2 relative"
              >
                <button
                  onClick={() => removeItem(idx)}
                  className="absolute top-1 right-1 text-gray-300 hover:text-red-500 p-1"
                >
                  <FiTrash2 size={16} />
                </button>

                {/* Placeholder Ảnh */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                  IMG
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate pr-6">
                    {it.product_name}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {it.size || "-"} / {it.color || "-"}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border rounded-lg bg-gray-50">
                      <button
                        onClick={() => updateQty(idx, it.quantity - 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold w-8 text-center">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(idx, it.quantity + 1)}
                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-sm text-blue-600">
                      {money(it.price * it.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. ADDITIONAL INPUTS */}
        <div className="space-y-3">
          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <FiTruck className="text-yellow-700" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder-yellow-700/50 text-yellow-900"
                placeholder="Mã vận đơn TQ (Tùy chọn)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
            </div>
          </div>

          <textarea
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none bg-gray-50"
            rows={2}
            placeholder="Ghi chú đơn hàng..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="h-24 sm:h-0"></div>
      </div>

      {/* 4. FOOTER TOTALS */}
      <div className="mt-auto pt-3 border-t bg-white sticky bottom-0 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">Tổng tiền hàng:</span>
          <span className="font-medium">{money(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            Đã đặt cọc:
          </span>
          <div className="w-32 relative">
            <input
              type="text"
              inputMode="numeric"
              // ✅ FIX: Format số khi hiển thị (100.000)
              value={formatNumberInput(deposit)}
              placeholder="0"
              onChange={(e) => {
                // Chỉ giữ lại số
                const raw = e.target.value
                  .replace(/\./g, "")
                  .replace(/\D/g, "");
                setDeposit(raw);
              }}
              className="w-full text-right font-bold text-green-600
                           border-b border-gray-200 focus:border-green-500
                           outline-none py-0.5 bg-transparent pr-4"
            />
            <span className="absolute right-0 top-0.5 text-xs text-gray-400 pointer-events-none">
              đ
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
          <span className="font-bold text-gray-700">CÒN PHẢI THU:</span>
          <span className="font-black text-lg text-red-600">
            {money(remaining)}
          </span>
        </div>

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
              Đang xử lý...
            </>
          ) : (
            <>✅ Tạo đơn hàng</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {createdOrder && (
          // ... (Giữ nguyên phần Popup thành công, chỉ lưu ý phần in PDF ở trên đã sửa)
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

            <div className="bg-gray-50 p-4 rounded-xl w-full mb-6 border border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã đơn:</span>{" "}
                <b>#{createdOrder.id}</b>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Khách:</span>{" "}
                <b>{createdOrder.customer?.name}</b>
              </div>
              <div className="border-t border-dashed my-2"></div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền:</span>{" "}
                <span>{money(createdOrder.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Đã cọc:</span>{" "}
                <span>{money(createdOrder.deposit)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t">
                <span>Còn lại:</span>
                <span>
                  {money(createdOrder.total - (createdOrder.deposit || 0))}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setCreatedOrder(null)}
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
