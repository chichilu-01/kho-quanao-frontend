import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import CustomerStats from "./CustomerStats";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import CustomerDetail from "./CustomerDetail";
import { FiGrid, FiList as FiListIcon } from "react-icons/fi";
import { FiPhoneCall } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";

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
      {/* TAB MOBILE (Header Fixed) */}
      <div
        className="
          md:hidden fixed top-0 left-0 right-0 z-40
          px-3 py-2
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
          shadow-sm border-b border-gray-100 dark:border-gray-800
        "
      >
        <div className="flex items-center gap-2">
          {/* GROUP TABS: Bên trái (chiếm phần lớn) */}
          <div className="flex flex-1 gap-1.5">
            {/* TAB: LIST */}
            <button
              onClick={() => setViewMode("list")}
              className={`
                flex-1 py-2 rounded-lg text-xs font-bold transition-all truncate
                ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }
              `}
            >
              Danh sách
            </button>

            {/* TAB: CREATE */}
            <button
              onClick={() => setViewMode("create")}
              className={`
                flex-1 py-2 rounded-lg text-xs font-bold transition-all truncate
                ${
                  viewMode === "create"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }
              `}
            >
              Thêm
            </button>

            {/* TAB: STATS */}
            <button
              onClick={() => setViewMode("stats")}
              className={`
                flex-1 py-2 rounded-lg text-xs font-bold transition-all truncate
                ${
                  viewMode === "stats"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }
              `}
            >
              TK
            </button>
          </div>

          {/* GROUP TOGGLE VIEW: Bên phải (Chỉ hiện khi ở tab Danh sách) */}
          {viewMode === "list" && (
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setListViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  listViewMode === "list"
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FiListIcon size={16} />
              </button>
              <button
                onClick={() => setListViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  listViewMode === "grid"
                    ? "bg-white dark:bg-gray-700 shadow text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <FiGrid size={16} />
              </button>
            </div>
          )}
        </div>
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

      {/* MOBILE CONTENT BODY */}
      <div className="md:hidden pt-[60px] pb-[80px]">
        {/* FULL DETAIL */}
        {viewMode === "detail" && detail && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="p-4">
              <button
                onClick={() => setViewMode("list")}
                className="text-blue-600 text-sm font-bold flex items-center gap-1"
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
          <div className="px-4 mt-4">
            {/* GRID VIEW CÓ AVATAR PRO */}
            {listViewMode === "grid" && (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => viewDetail(c)}
                    className="relative overflow-hidden p-3 rounded-2xl bg-white dark:bg-gray-900 
                               border border-gray-200 dark:border-gray-700 cursor-pointer 
                               transition-all duration-300 shadow-sm
                               active:scale-95"
                  >
                    {/* VIP badge */}
                    {c.total_orders > 3 && (
                      <span className="absolute top-1 right-1 bg-yellow-400 text-[9px] px-1.5 py-[1px] rounded-full font-bold shadow">
                        VIP
                      </span>
                    )}

                    <div className="flex flex-col gap-2 items-center text-center">
                      {/* Avatar Gradient */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-base shadow-sm"
                        style={{
                          background: getAvatarGradient(c.name),
                        }}
                      >
                        {getInitial(c.name)}
                      </div>

                      {/* Thông tin khách */}
                      <div className="w-full min-w-0">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {c.phone}
                        </p>
                      </div>
                    </div>

                    {/* Nút Gọi + FB */}
                    <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <a
                        href={`tel:${c.phone}`}
                        className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 bg-blue-50 text-blue-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiPhoneCall size={12} />
                      </a>
                      {c.facebook_url && (
                        <a
                          href={c.facebook_url}
                          target="_blank"
                          className="flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 bg-indigo-50 text-indigo-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaFacebookF size={12} />
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
