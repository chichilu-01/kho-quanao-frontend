// src/pages/orders/CreateOrder.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import { motion } from "framer-motion";
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

  // 🔹 Load danh sách khách và sản phẩm
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
        notify.error("⚠️ Không thể tải dữ liệu khách hàng hoặc sản phẩm");
      }
    })();
  }, []);

  // 🔹 Load biến thể theo sản phẩm
  const loadVariants = useCallback(async (pid) => {
    if (!pid) return setVariants([]);
    try {
      const data = await api(`/variants/by-product/${pid}`);
      setVariants(data);
    } catch {
      notify.error("⚠️ Không thể tải biến thể của sản phẩm");
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) loadVariants(selectedProductId);
  }, [selectedProductId, loadVariants]);

  return (
    <div className="grid md:grid-cols-2 gap-6 p-4 pb-20 md:pb-10">
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
          loadVariants={loadVariants}
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
        loadVariants={loadVariants}
        selectedProductId={selectedProductId}
      />
    </div>
  );
}
