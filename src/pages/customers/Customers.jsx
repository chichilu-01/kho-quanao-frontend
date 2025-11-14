import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import CustomerStats from "./CustomerStats";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import CustomerDetail from "./CustomerDetail";
import { FiGrid, FiList as FiListIcon } from "react-icons/fi";

function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

// 🎨 Avatar Gradient 2 màu hiện đại
const avatarGradients = [
  ["#FF9A9E", "#FECFEF"],
  ["#A18CD1", "#FBC2EB"],
  ["#84FAB0", "#8FD3F4"],
  ["#89F7FE", "#66A6FF"],
  ["#F6D365", "#FDA085"],
  ["#5EE7DF", "#B490CA"],
  ["#FF8177", "#FF867A"],
  ["#92FE9D", "#00C9FF"],
];

function getAvatarGradient(name = "") {
  const i = (name.charCodeAt(0) || 0) % avatarGradients.length;
  const [from, to] = avatarGradients[i];
  return `linear-gradient(135deg, ${from}, ${to})`;
}

// Lấy 2 ký tự đầu (NA, TM…)
function getInitial(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name.trim()[0] || "?").toUpperCase();
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

  // 👉 Mặc định là GRID
  const [listViewMode, setListViewMode] = useState("grid");

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
      {/* TAB MOBILE */}
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
        <button
          onClick={() => setViewMode("stats")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            viewMode === "stats"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Thống kê
        </button>
      </div>

      {/* PC LAYOUT GIỮ NGUYÊN */}
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
        {/* FULL DETAIL */}
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

        {/* CREATE */}
        {viewMode === "create" && (
          <CustomerForm form={form} setForm={setForm} submit={submit} />
        )}

        {/* LIST */}
        {viewMode === "list" && (
          <div className="px-4">

            {/* 🔥 NÚT ĐỔI GRID / LIST */}
            <div className="flex justify-end mb-3">
              <button
                onClick={() =>
                  setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                }
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shadow hover:shadow-md 
                           transition-all active:scale-95 border border-gray-300/40 dark:border-gray-700/40"
              >
                {listViewMode === "grid" ? (
                  <FiGrid className="text-xl text-blue-600" />
                ) : (
                  <FiListIcon className="text-xl text-blue-600" />
                )}
              </button>
            </div>

            {/* ⭐ GRID VIEW CÓ AVATAR PRO */}
            {listViewMode === "grid" && (
              <div className="grid grid-cols-2 gap-4">
                {filtered.map((c, i) => (
                  <div
                    key={c.id}
                    onClick={() => viewDetail(c)}
                    className="relative p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  
                               cursor-pointer shadow-sm transition-all duration-300
                               hover:shadow-xl hover:-translate-y-[4px] hover:border-blue-400/50
                               animate-fadeIn"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* VIP Badge */}
                    {c.total_orders > 3 && (
                      <span className="absolute top-1 right-1 bg-yellow-400 text-[10px] px-2 py-[2px] rounded-full font-bold shadow">
                        VIP
                      </span>
                    )}

                    <div className="flex gap-3 items-center">
                      {/* Avatar Gradient PRO */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white text-lg
                                   shadow-[4px_4px_10px_rgba(0,0,0,0.2),-3px_-3px_8px_rgba(255,255,255,0.3)]
                                   border border-white/20 animate-avatarPulse"
                        style={{
                          background: getAvatarGradient(c.name),
                        }}
                      >
                        {getInitial(c.name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{c.phone}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {c.address || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex gap-3 mt-3 text-xs opacity-90">
                      <a
                        href={`tel:${c.phone}`}
                        className="flex-1 py-1.5 rounded-lg text-center bg-blue-50 dark:bg-blue-900/30 
                                   text-blue-600 dark:text-blue-300 font-medium hover:bg-blue-100 active:scale-95 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Gọi
                      </a>

                      {c.facebook_url && (
                        <a
                          href={c.facebook_url}
                          target="_blank"
                          className="flex-1 py-1.5 rounded-lg text-center bg-indigo-50 dark:bg-indigo-900/30 
                                     text-indigo-600 dark:text-indigo-300 font-medium hover:bg-indigo-100 active:scale-95 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          FB
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIST VIEW CŨ */}
            {listViewMode === "list" && (
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
        )}


        {/* STATS */}
        {viewMode === "stats" && <CustomerStats stats={stats} />}
      </div>
    </div>
  );
}
