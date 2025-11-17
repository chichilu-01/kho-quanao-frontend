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
    try {
      const data = await api(`/variants/by-product/${pid}`);
      setVariants(data);
    } catch {
      notify.error("⚠️ Không thể tải biến thể");
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

      {/* PC: giữ nguyên 2 cột */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 p-4 pb-20 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border shadow-md"
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

          <OrderProductSelector
            products={products}
            variants={variants}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            items={items}
            setItems={setItems}
          />
        </motion.div>

        <OrderCart
          items={items}
          setItems={setItems}
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
        />
      </div>

      {/* --------------------------------------------------------------- */}
      {/* MOBILE FULL SCREEN LAYOUT */}
      {/* --------------------------------------------------------------- */}
      <div className="md:hidden px-4 pt-[70px] pb-[80px]">
        {viewMode === "customer" && (
          <motion.div
            key="customer"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
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
          </motion.div>
        )}

        {viewMode === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <OrderProductSelector
              products={products}
              variants={variants}
              selectedProductId={selectedProductId}
              setSelectedProductId={setSelectedProductId}
              items={items}
              setItems={setItems}
            />
          </motion.div>
        )}

        {viewMode === "cart" && (
          <motion.div
            key="cart"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <OrderCart
              items={items}
              setItems={setItems}
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
            />
          </motion.div>
        )}
      </div>
    </>
  );
}
