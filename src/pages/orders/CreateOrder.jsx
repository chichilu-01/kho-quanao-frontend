// src/pages/orders/CreateOrder.jsx
import { useState, useEffect, useCallback } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { motion } from "framer-motion";

import MobileTabs from "../../components/common/MobileTabs";
import { FiUser, FiBox, FiShoppingCart } from "react-icons/fi";

import OrderCustomerForm from "./OrderCustomerForm";
import OrderProductSelector from "./OrderProductSelector";
import OrderCart from "./OrderCart";

export default function CreateOrder() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);

  // State loading riêng cho biến thể
  const [loadingVariants, setLoadingVariants] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    facebook_url: "",
    notes: "",
  });

  const [selectedProductId, setSelectedProductId] = useState("");
  const [items, setItems] = useState([]);

  // 👇 THÊM STATE TIỀN CỌC Ở ĐÂY 👇
  const [deposit, setDeposit] = useState(0);

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  // 🔥 MOBILE TABS
  const [viewMode, setViewMode] = useState("customer");

  const orderTabs = [
    { value: "customer", label: "Khách", icon: FiUser },
    { value: "products", label: "Sản phẩm", icon: FiBox },
    {
      value: "cart",
      label: "Giỏ hàng",
      icon: FiShoppingCart,
      disabled: items.length === 0,
      onClick: () => {
        if (items.length === 0) notify.info("🛒 Chưa có sản phẩm nào!");
      },
    },
  ];

  // 🔹 Load customers & products
  useEffect(() => {
    (async () => {
      try {
        const [cs, ps] = await Promise.all([
          api("/customers"),
          api("/products"),
        ]);
        setCustomers(cs);
        setProducts(ps);
      } catch {
        notify.error("⚠️ Không thể tải dữ liệu khách hoặc sản phẩm");
      }
    })();
  }, []);

  // 🔹 Load variants for selected product
  const loadVariants = useCallback(async (pid) => {
    if (!pid) return setVariants([]);

    setLoadingVariants(true); // Bắt đầu load
    try {
      const data = await api(`/variants/by-product/${pid}`);
      setVariants(data);
    } catch {
      notify.error("⚠️ Không thể tải biến thể");
    } finally {
      setLoadingVariants(false); // Kết thúc load
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) loadVariants(selectedProductId);
  }, [selectedProductId, loadVariants]);

  return (
    <>
      {/* Mobile Tabs */}
      <MobileTabs
        options={orderTabs}
        viewMode={viewMode}
        setViewMode={setViewMode}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"
      />

      {/* PC: 2 cột */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 pb-20 md:pb-10 h-[calc(100vh-60px)] overflow-hidden">
        {/* CỘT TRÁI: KHÁCH + SẢN PHẨM (Scrollable) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border shadow-sm overflow-y-auto h-full space-y-6"
        >
          <OrderCustomerForm
            customers={customers}
            isNewCustomer={isNewCustomer}
            setIsNewCustomer={setIsNewCustomer}
            newCustomer={newCustomer}
            setNewCustomer={setNewCustomer}
            customerId={customerId}
            setCustomerId={setCustomerId}
          />

          <div className="border-t pt-4">
            <OrderProductSelector
              products={products}
              variants={variants}
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              loadVariants={loadVariants}
              items={items}
              setItems={setItems}
              loadingVariants={loadingVariants} // Truyền state loading xuống
            />
          </div>
        </motion.div>

        {/* CỘT PHẢI: GIỎ HÀNG (Fixed height) */}
        <OrderCart
          items={items}
          setItems={setItems}
          // 👇 Truyền deposit xuống
          deposit={deposit}
          setDeposit={setDeposit}
          note={note}
          setNote={setNote}
          customerId={customerId}
          customers={customers}
          isNewCustomer={isNewCustomer}
          newCustomer={newCustomer}
          createdOrder={createdOrder}
          setCreatedOrder={setCreatedOrder}
          loading={loading}
          setLoading={setLoading}
          loadVariants={loadVariants} // Để refresh kho sau khi đặt
          selectedProductId={selectedProductId}
        />
      </div>

      {/* --------------------------------------------------------------- */}
      {/* MOBILE FULL SCREEN LAYOUT */}
      {/* --------------------------------------------------------------- */}
      <div className="md:hidden px-4 pt-[70px] pb-[80px]">
        {viewMode === "customer" && (
          <motion.div
            key="customer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <OrderCustomerForm
              customers={customers}
              isNewCustomer={isNewCustomer}
              setIsNewCustomer={setIsNewCustomer}
              newCustomer={newCustomer}
              setNewCustomer={setNewCustomer}
              customerId={customerId}
              setCustomerId={setCustomerId}
            />
            {/* Nút Next sang Product */}
            <button
              onClick={() => setViewMode("products")}
              className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg"
            >
              Tiếp tục chọn sản phẩm →
            </button>
          </motion.div>
        )}

        {viewMode === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <OrderProductSelector
              products={products}
              variants={variants}
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              loadVariants={loadVariants}
              items={items}
              setItems={setItems}
              loadingVariants={loadingVariants}
            />
            {/* Floating button tới giỏ hàng nếu đã chọn đồ */}
            {items.length > 0 && (
              <button
                onClick={() => setViewMode("cart")}
                className="fixed bottom-20 right-4 bg-green-600 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 animate-bounce"
              >
                <FiShoppingCart /> Giỏ hàng ({items.length})
              </button>
            )}
          </motion.div>
        )}

        {viewMode === "cart" && (
          <motion.div
            key="cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <OrderCart
              items={items}
              setItems={setItems}
              // 👇 Truyền deposit xuống cho mobile
              deposit={deposit}
              setDeposit={setDeposit}
              note={note}
              setNote={setNote}
              customerId={customerId}
              customers={customers}
              isNewCustomer={isNewCustomer}
              newCustomer={newCustomer}
              createdOrder={createdOrder}
              setCreatedOrder={setCreatedOrder}
              loading={loading}
              setLoading={setLoading}
              loadVariants={loadVariants}
              selectedProductId={selectedProductId}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
