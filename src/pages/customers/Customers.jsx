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

  const [viewMode, setViewMode] = useState("list");

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
      const total_revenue = res.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      );
      const customers = await api("/customers");
      setStats({
        total_customers: customers.length,
        total_orders,
        total_revenue,
      });
    } catch {
      notify.error("Không thể tải thống kê khách hàng");
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q),
    );
  }, [list, search]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/customers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      notify.success("Đã thêm khách hàng mới");
      setForm({
        name: "",
        phone: "",
        address: "",
        facebook_url: "",
        notes: "",
      });
      await loadList();
    } catch {
      notify.error("Lỗi khi thêm khách hàng");
    }
  };

  const viewDetail = async (c) => {
    setSelected(c);
    setLoadingDetail(true);
    if (window.innerWidth < 768) setViewMode("detail");
    try {
      const data = await api(`/customers/${c.id}`);
      setDetail(data);
    } catch {
      notify.error("Không tải được chi tiết khách hàng");
    }
    setLoadingDetail(false);
  };

  return (
    <div className="relative z-0 space-y-6 pb-20 md:pb-10">
      <CustomerStats stats={stats} />

      {/* 🔹 TAB MOBILE */}
      <div className="flex gap-2 px-4 md:hidden">
        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Danh sách
        </button>

        <button
          onClick={() => setViewMode("create")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            viewMode === "create"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Thêm khách
        </button>
      </div>

      {/* PC */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 relative z-0">
        <div className="md:col-span-1">
          <CustomerForm form={form} setForm={setForm} submit={submit} />
        </div>

        <div className="md:col-span-1">
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

        <div className="md:col-span-1">
          {detail && (
            <div className="p-4 rounded-lg border bg-white shadow">
              <CustomerDetail
                detail={detail}
                editing={editing}
                setEditing={setEditing}
                viewDetail={viewDetail}
                setDetail={setDetail}
                setSelected={setSelected}
                loadList={loadList}
              />
            </div>
          )}
        </div>
      </div>

      {/* MOBILE */}
      <div className="md:hidden pt-[60px] pb-[80px]">
        {/* FULL SCREEN DETAIL */}
        {viewMode === "detail" && detail && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setViewMode("list")}
                className="text-blue-600 text-sm"
              >
                ← Quay lại
              </button>
            </div>

            <div className="w-full">
              <CustomerDetail
                detail={detail}
                editing={editing}
                setEditing={setEditing}
                viewDetail={viewDetail}
                setDetail={setDetail}
                setSelected={setSelected}
                loadList={loadList}
              />
            </div>
          </div>
        )}

        {viewMode === "create" && (
          <CustomerForm form={form} setForm={setForm} submit={submit} />
        )}

        {viewMode === "list" && (
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
        )}
      </div>
    </div>
  );
}
