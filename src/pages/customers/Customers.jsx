import { useEffect, useMemo, useState, useRef } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import CustomerStats from "./CustomerStats";
import CustomerForm from "./CustomerForm";
import CustomerList from "./CustomerList";
import CustomerDetail from "./CustomerDetail";
import {
  FiGrid,
  FiList as FiListIcon,
  FiPhoneCall,
  FiChevronLeft,
  FiSearch,
  FiFilter,
  FiStar,
  FiUserPlus,
} from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
// 1. Import Context để xử lý ẩn hiện Menu
import { useNav } from "../../context/NavContext";

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
  const [onlyVIP, setOnlyVIP] = useState(false);

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
  const [listViewMode, setListViewMode] = useState("grid");

  // 2. Setup Hook ẩn hiện Menu
  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  // 3. Logic xử lý cuộn
  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (currentScrollY < 0) return;

    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setIsNavVisible(false);
    } else if (currentScrollY < lastScrollY.current) {
      setIsNavVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };

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
    setIsNavVisible(true);
    loadList();
  }, []);

  const filtered = useMemo(() => {
    return list.filter((c) => {
      // 1. Lọc VIP
      if (onlyVIP && (c.total_orders || 0) < 3) return false;

      // 2. Tìm kiếm (Tên hoặc SĐT)
      const q = search.trim().toLowerCase();
      if (!q) return true;

      const phoneClean = (c.phone || "").replace(/\D/g, "");
      const searchClean = q.replace(/\D/g, "");

      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (searchClean && phoneClean.includes(searchClean))
      );
    });
  }, [list, search, onlyVIP]);

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
      setViewMode("list");
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
    <>
      <style>{`
        .hide-scroll-force::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scroll-force { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}</style>

      <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
        {/* HEADER MOBILE */}
        <div className="md:hidden shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-20">
          <div className="flex items-center justify-between p-3 gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-blue-600" : "text-gray-500"}`}
              >
                Danh sách
              </button>
              <button
                onClick={() => setViewMode("stats")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === "stats" ? "bg-white dark:bg-gray-700 shadow text-blue-600" : "text-gray-500"}`}
              >
                Thống kê
              </button>
            </div>

            <button
              onClick={() => setViewMode("create")}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-transform"
            >
              <FiUserPlus size={20} />
            </button>
          </div>

          {viewMode === "list" && (
            <div className="px-3 pb-3 flex items-center gap-2">
              <div className="relative flex-1">
                <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm tên, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <button
                onClick={() => setOnlyVIP(!onlyVIP)}
                className={`
                  h-9 px-3 rounded-xl flex items-center gap-1 text-xs font-bold border transition-all
                  ${
                    onlyVIP
                      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                      : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700"
                  }
                `}
              >
                <FiStar
                  className={onlyVIP ? "fill-yellow-500 text-yellow-500" : ""}
                />
                VIP
              </button>

              <button
                onClick={() =>
                  setListViewMode((m) => (m === "grid" ? "list" : "grid"))
                }
                className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500"
              >
                {listViewMode === "grid" ? <FiListIcon /> : <FiGrid />}
              </button>
            </div>
          )}
        </div>

        {/* BODY CONTENT */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto hide-scroll-force p-3 pb-24 md:p-6 md:pb-6"
        >
          <div className="hidden md:grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <CustomerForm form={form} setForm={setForm} submit={submit} />
            </div>
            <div className="md:col-span-1">
              <CustomerList
                filtered={filtered}
                selected={selected}
                setSelected={setSelected}
                viewDetail={viewDetail}
              />
            </div>
            <div className="md:col-span-1">
              {detail && (
                <div className="p-4 rounded-lg border bg-white shadow">
                  <CustomerDetail detail={detail} />
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden">
            {viewMode === "create" && (
              <CustomerForm form={form} setForm={setForm} submit={submit} />
            )}

            {viewMode === "stats" && <CustomerStats stats={stats} />}

            {viewMode === "list" && (
              <div
                className={
                  listViewMode === "grid"
                    ? "grid grid-cols-2 gap-3"
                    : "flex flex-col gap-3"
                }
              >
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => viewDetail(c)}
                    className={`
                      relative overflow-hidden bg-white dark:bg-gray-900 
                      border border-gray-100 dark:border-gray-800 cursor-pointer 
                      shadow-sm active:scale-95 transition-all
                      ${listViewMode === "grid" ? "p-3 rounded-2xl flex flex-col items-center text-center gap-2" : "p-3 rounded-xl flex items-center gap-3"}
                    `}
                  >
                    {c.total_orders > 3 && (
                      <span className="absolute top-0 right-0 bg-yellow-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm z-10">
                        VIP
                      </span>
                    )}

                    <div
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-inner"
                      style={{ background: getAvatarGradient(c.name) }}
                    >
                      {getInitial(c.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate">
                        {c.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {c.phone || "Chưa có SĐT"}
                      </p>
                      {listViewMode !== "grid" && c.address && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {c.address}
                        </p>
                      )}
                    </div>

                    {listViewMode !== "grid" && (
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600"
                      >
                        <FiPhoneCall size={14} />
                      </a>
                    )}

                    {listViewMode === "grid" && (
                      <div className="w-full pt-2 border-t border-gray-50 dark:border-gray-800 flex gap-2 mt-auto">
                        <a
                          href={`tel:${c.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center"
                        >
                          <FiPhoneCall size={14} />
                        </a>
                        {c.facebook_url && (
                          <a
                            href={c.facebook_url}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg flex items-center justify-center"
                          >
                            <FaFacebookF size={14} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-400 flex flex-col items-center">
                    <FiSearch size={40} className="mb-2 opacity-50" />
                    <p>Không tìm thấy khách hàng nào.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {viewMode === "detail" && detail && (
          <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col animate-slideIn">
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center gap-3 border-b dark:border-gray-700 shadow-sm shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
              >
                <FiChevronLeft size={24} />
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{detail.name}</h3>
                <p className="text-xs text-gray-500">Thông tin chi tiết</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto hide-scroll-force">
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
      </div>
    </>
  );
}
