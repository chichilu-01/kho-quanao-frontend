import { useEffect, useMemo, useState, useRef } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import CustomerStats from "./CustomerStats";
import CustomerForm from "./CustomerForm";
import CustomerDetail from "./CustomerDetail";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiList as FiListIcon,
  FiPhoneCall,
  FiChevronLeft,
  FiSearch,
  FiStar,
  FiUserPlus,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { useNav } from "../../context/NavContext";

// --- UTILS ---
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

function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

// --- MAIN COMPONENT ---
export default function Customers() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [onlyVIP, setOnlyVIP] = useState(false);

  // Modal State cho PC
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const { setIsNavVisible } = useNav();
  const lastScrollY = useRef(0);

  // Logic scroll (Mobile only mainly)
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

  useEffect(() => {
    setIsNavVisible(true);
    loadList();
  }, []);

  const loadList = async () => {
    try {
      // 1. Gọi song song cả API khách hàng và API đơn hàng
      const [customersData, ordersData] = await Promise.all([
        api("/customers"),
        api("/orders"),
      ]);

      // 2. Tính toán số liệu tổng quan (Stats) ngay tại đây
      const total_revenue = ordersData.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      );
      setStats({
        total_customers: customersData.length,
        total_orders: ordersData.length,
        total_revenue,
      });

      // 3. MAP DỮ LIỆU: Tính tổng đơn và chi tiêu cho TỪNG khách hàng
      const mergedList = customersData.map((cust) => {
        // Lọc ra các đơn hàng của khách này
        const customerOrders = ordersData.filter(
          (o) =>
            (o.customer_id && String(o.customer_id) === String(cust.id)) ||
            (o.phone && o.phone === cust.phone),
        );

        const total_orders = customerOrders.length;
        const total_spent = customerOrders.reduce(
          (sum, o) => sum + Number(o.total || 0),
          0,
        );

        return {
          ...cust,
          total_orders, // Gán số lượng đơn vào khách
          total_spent, // Gán tổng tiền vào khách
        };
      });

      setList(mergedList);
    } catch (err) {
      console.error(err);
      notify.error("Không thể tải dữ liệu");
    }
  };

  const filtered = useMemo(() => {
    return list.filter((c) => {
      if (onlyVIP && (c.total_orders || 0) < 3) return false;
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
      notify.success("Thêm khách hàng thành công");
      setForm({
        name: "",
        phone: "",
        address: "",
        facebook_url: "",
        notes: "",
      });
      await loadList();
      setShowCreateModal(false); // Đóng modal PC
      setViewMode("list"); // Quay về list Mobile
    } catch {
      notify.error("Lỗi thêm khách hàng");
    }
  };

  const viewDetail = async (c) => {
    if (selected?.id === c.id) return; // Tránh reload nếu đang chọn
    setSelected(c);
    setLoadingDetail(true);
    if (window.innerWidth < 768) setViewMode("detail");
    try {
      const data = await api(`/customers/${c.id}`);
      setDetail(data);
    } catch {
      notify.error("Lỗi tải chi tiết");
    }
    setLoadingDetail(false);
  };

  return (
    <>
      <style>{`
        .hide-scroll-force::-webkit-scrollbar { display: none !important; width: 0 !important; }
        .hide-scroll-force { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        /* Animation cho modal */
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* --- CONTAINER CHÍNH --- */}
      {/* 🔥 SỬA TẠI ĐÂY: pt-0 md:pt-16 */}
      <div className="h-[100dvh] w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden pt-0 md:pt-16">
        {/* ================= HEADER MOBILE ================= */}
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
                className={`h-9 px-3 rounded-xl flex items-center gap-1 text-xs font-bold border transition-all ${onlyVIP ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700"}`}
              >
                <FiStar
                  className={onlyVIP ? "fill-yellow-500 text-yellow-500" : ""}
                />{" "}
                VIP
              </button>
            </div>
          )}
        </div>

        {/* ================= PC LAYOUT (NEW & PRO) ================= */}
        <div className="hidden md:flex flex-col h-full">
          {/* PC Header Toolbar */}
          <div className="shrink-0 px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Khách hàng
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý danh sách và lịch sử mua hàng
              </p>
            </div>

            <div className="flex gap-3">
              {/* Search Box PC */}
              <div className="relative group">
                <FiSearch className="absolute top-3 left-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 bg-gray-100 dark:bg-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30 border border-transparent focus:border-blue-500 transition-all"
                />
              </div>

              {/* Filter VIP */}
              <button
                onClick={() => setOnlyVIP(!onlyVIP)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all hover:shadow-sm ${onlyVIP ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <FiStar className={onlyVIP ? "fill-yellow-500" : ""} />
                VIP
              </button>

              {/* Add Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
              >
                <FiUserPlus size={18} /> Thêm khách
              </button>
            </div>
          </div>

          {/* PC Main Content Split View */}
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT: Customer Table List (65%) */}
            <div
              className={`flex-1 overflow-y-auto hide-scroll-force p-6 transition-all ${selected ? "w-2/3 border-r border-gray-200 dark:border-gray-700" : "w-full"}`}
            >
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Tổng khách
                  </div>
                  <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                    {stats.total_customers}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Đơn hàng
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.total_orders}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-bold">
                    Doanh thu
                  </div>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {money(stats.total_revenue)}
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-4">Khách hàng</th>
                      <th className="px-6 py-4">Liên hệ</th>
                      <th className="px-6 py-4 text-center">Đơn hàng</th>
                      <th className="px-6 py-4 text-right">Chi tiêu</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filtered.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => viewDetail(c)}
                        className={`cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10 ${selected?.id === c.id ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                              style={{ background: getAvatarGradient(c.name) }}
                            >
                              {getInitial(c.name)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-1">
                                {c.name}
                                {c.total_orders > 3 && (
                                  <FiStar className="text-yellow-400 fill-yellow-400 text-[10px]" />
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: #{c.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {c.phone}
                          </div>
                          {c.address && (
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">
                              {c.address}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.total_orders > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                          >
                            {c.total_orders || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-700 dark:text-gray-300">
                          {money(c.total_spent || 0)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <FiChevronLeft
                            className={`text-gray-400 transition-transform ${selected?.id === c.id ? "rotate-180 text-blue-500" : ""}`}
                          />
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-400"
                        >
                          <FiSearch
                            size={40}
                            className="mx-auto mb-3 opacity-30"
                          />
                          Không tìm thấy khách hàng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: Detail Sidebar (35%) */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-[400px] xl:w-[450px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-10 flex flex-col h-full"
                >
                  {/* Detail Header */}
                  <div className="shrink-0 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200">
                      Chi tiết khách hàng
                    </h3>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-2 hover:bg-gray-200 rounded-full transition"
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* Detail Content */}
                  <div className="flex-1 overflow-y-auto hide-scroll-force p-4">
                    {loadingDetail ? (
                      <div className="flex justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      </div>
                    ) : detail ? (
                      <CustomerDetail
                        detail={detail}
                        editing={editing}
                        setEditing={setEditing}
                        viewDetail={viewDetail}
                        setDetail={setDetail}
                        setSelected={setSelected}
                        loadList={loadList}
                      />
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        Vui lòng chọn khách hàng
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ================= MOBILE LAYOUT (Giữ nguyên) ================= */}
        <div className="md:hidden flex-1 overflow-y-auto hide-scroll-force p-3 pb-24">
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
                  className={`relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 cursor-pointer shadow-sm active:scale-95 transition-all ${listViewMode === "grid" ? "p-3 rounded-2xl flex flex-col items-center text-center gap-2" : "p-3 rounded-xl flex items-center gap-3"}`}
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
            </div>
          )}
        </div>

        {/* MODAL CREATE (PC) */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">Thêm khách hàng mới</h2>
              <CustomerForm
                form={form}
                setForm={setForm}
                submit={submit}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        )}

        {/* MODAL DETAIL (Mobile) */}
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
