import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import CustomerStats from "./CustomerStats";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import CustomerDetail from "./CustomerDetail";

function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

export default function Customers() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editing, setEditing] = useState(false);

  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total_customers: 0,
    total_orders: 0,
    total_revenue: 0,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    facebook_url: "",
    notes: "",
  });

  // 🔹 Nạp danh sách khách + thống kê
  const loadList = async () => {
    try {
      const data = await api("/customers");
      setList(data);
      await loadStats();
    } catch (err) {
      notify.error("Không thể tải danh sách khách hàng");
    }
  };

  const loadStats = async () => {
    try {
      const res = await api("/orders");
      const total_orders = res.length;
      const total_revenue = res.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const customers = await api("/customers");
      setStats({
        total_customers: customers.length,
        total_orders,
        total_revenue,
      });
    } catch (err) {
      notify.error("Không thể tải thống kê khách hàng");
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // 🔍 Lọc nhanh client
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
    );
  }, [list, search]);

  // ➕ Thêm khách hàng
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/customers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      notify.success("✅ Đã thêm khách hàng mới");
      setForm({
        name: "",
        phone: "",
        address: "",
        facebook_url: "",
        notes: "",
      });
      await loadList();
    } catch (err) {
      notify.error("❌ Lỗi khi thêm khách hàng");
    }
  };

  // 🔎 Xem chi tiết khách
  const viewDetail = async (c) => {
    setSelected(c);
    setLoadingDetail(true);
    try {
      const data = await api(`/customers/${c.id}`);
      setDetail(data);
    } catch (e) {
      notify.error("❌ Không tải được chi tiết khách hàng");
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="relative z-0 space-y-6 pb-20 md:pb-10">
      <CustomerStats stats={stats} />

      <div className="grid md:grid-cols-2 gap-6 relative z-0">
        <CustomerForm form={form} setForm={setForm} submit={submit} />
        <CustomerList
          filtered={filtered}
          selected={selected}
          setSelected={setSelected}
          viewDetail={viewDetail}
          search={search}
          setSearch={setSearch}
          loadList={loadList}
          detail={detail}
          setDetail={setDetail}
          editing={editing}
          setEditing={setEditing}
          loadingDetail={loadingDetail}
        />
      </div>
    </div>
  );
}
