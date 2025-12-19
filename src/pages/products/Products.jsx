import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { FiList, FiPlus, FiEdit3, FiGrid, FiSearch, FiChevronLeft } from "react-icons/fi";
import { api } from "../../api/client";

import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductDetail from "./ProductDetail";
import { RestockModal, DeleteModal } from "./ProductModals";
import MobileTabs from "../../components/common/MobileTabs";

export default function Products() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [restockModal, setRestockModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  const [listLoading, setListLoading] = useState(false);

  // Tabs mobile
  const [viewMode, setViewMode] = useState("list");

  // ⭐ UI STATE MỚI: Quản lý chế độ xem (Lưới/Danh sách)
  const [listViewMode, setListViewMode] = useState("list"); // 'list' | 'grid'
  const [gridColumns, setGridColumns] = useState(3); // 2 | 3 | 4 cột

  // ------------------------------------------------------------------
  // LOAD DATA
  // ------------------------------------------------------------------
  const load = async (selectId, q = "") => {
    try {
      setListLoading(true);
      const data = await api(`/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const arr = Array.isArray(data) ? data : [];
      setList(arr);

      if (selectId) {
        const found = arr.find((x) => x.id === selectId);
        setSelected(found || null);
      } else if (!selected && arr?.length && window.innerWidth >= 768) {
        // Desktop: Tự chọn item đầu tiên nếu chưa chọn gì
        setSelected(arr[0]);
      }
    } catch (err) {
      toast.error("❌ Lỗi tải danh sách sản phẩm");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ------------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------------
  const brands = useMemo(() => [...new Set(list.map((p) => p.brand).filter(Boolean))], [list]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
      const matchBrand = selectedBrand ? p.brand === selectedBrand : true;
      return matchSearch && matchBrand;
    });
  }, [list, search, selectedBrand]);

  const productTabs = [
    { value: "list", label: "Danh sách", icon: FiList },
    { value: "create", label: "Thêm mới", icon: FiPlus },
    { value: "edit", label: "Chi tiết", icon: FiEdit3, disabled: !selected },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Toaster position="top-right" toastOptions={{ duration: 2200 }} />

        {/* MOBILE TABS (Bottom Navigation) */}
        <div className="md:hidden">
          <MobileTabs options={productTabs} viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* --- DESKTOP LAYOUT (2 Columns Split View) --- */}
        <div className="hidden md:grid md:grid-cols-12 gap-6 h-screen p-6 overflow-hidden">

          {/* CỘT TRÁI: DANH SÁCH & BỘ LỌC (Chiếm 4-5 phần) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-5 lg:col-span-4 flex flex-col h-full space-y-4">

            {/* Header Toolbar: Title, Create Button, View Toggles */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    📦 Kho hàng <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{list.length}</span>
                  </h2>
                  <button 
                    onClick={() => setSelected(null)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-md shadow-blue-200 dark:shadow-none transition-all flex items-center gap-1.5"
                  >
                    <FiPlus /> Mới
                  </button>
               </div>

               {/* View Switcher & Search */}
               <div className="flex gap-2">
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 flex-shrink-0">
                    <button 
                      onClick={() => setListViewMode("list")}
                      className={`p-1.5 rounded-md transition-all ${listViewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Danh sách"
                    >
                      <FiList size={18} />
                    </button>
                    <button 
                      onClick={() => setListViewMode("grid")}
                      className={`p-1.5 rounded-md transition-all ${listViewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Lưới"
                    >
                      <FiGrid size={18} />
                    </button>
                  </div>

                  {/* Grid Columns Controller (Chỉ hiện khi mode Grid) */}
                  {listViewMode === 'grid' && (
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 gap-1 flex-shrink-0">
                       {[2, 3].map(cols => (
                         <button 
                           key={cols} onClick={() => setGridColumns(cols)}
                           className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${gridColumns === cols ? 'bg-white dark:bg-gray-600 shadow text-blue-600' : 'text-gray-400'}`}
                         >
                           {cols}
                         </button>
                       ))}
                    </div>
                  )}
               </div>
            </div>

            {/* Product List Container */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative">
               <div className="absolute inset-0 overflow-y-auto pr-1 custom-scrollbar p-3">
                 <ProductList
                    list={list} filtered={filtered} brands={brands}
                    selected={selected} setSelected={setSelected}
                    listLoading={listLoading}
                    setSearch={setSearch} search={search}
                    selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                    onRestock={(p) => { setRestockProduct(p); setRestockQty(""); setRestockModal(true); }}
                    reload={load}
                    // Props giao diện mới
                    viewType={listViewMode} 
                    gridCols={gridColumns}
                  />
               </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI: CHI TIẾT / FORM (Chiếm phần còn lại) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-7 lg:col-span-8 h-full flex flex-col">
             <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 flex-1 overflow-hidden relative">
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6">
                  {selected ? (
                    <ProductDetail selected={selected} setSelected={setSelected} load={load} />
                  ) : (
                    <ProductForm load={load} />
                  )}
                </div>
             </div>
          </motion.div>
        </div>

        {/* --- MOBILE LAYOUT (App-like Interface) --- */}
        <div className="md:hidden flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">

          {/* 1. STICKY HEADER (Luôn dính trên cùng) */}
          {viewMode === 'list' && (
            <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3">

              {/* Row 1: Title & Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  📦 Kho hàng <span className="text-xs font-normal bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500">{list.length}</span>
                </h2>
                <div className="flex gap-2">
                   {/* Toggle View Mobile */}
                   <button 
                     onClick={() => setListViewMode(m => m === 'grid' ? 'list' : 'grid')}
                     className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300 active:scale-90 transition-transform border border-gray-200 dark:border-gray-700"
                   >
                     {listViewMode === 'grid' ? <FiList size={18}/> : <FiGrid size={18}/>}
                   </button>
                   {/* Add Button */}
                   <button 
                     onClick={() => setViewMode("create")}
                     className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/30 active:scale-90 transition-transform"
                   >
                     <FiPlus size={18}/>
                   </button>
                </div>
              </div>

              {/* Row 2: Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <FiSearch className="absolute top-2.5 left-3 text-gray-400"/>
                   <input 
                     className="w-full bg-gray-100 dark:bg-gray-800 pl-9 pr-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/50 border-transparent focus:bg-white dark:focus:bg-gray-900 transition-colors"
                     placeholder="Tìm tên, SKU..."
                     value={search} onChange={e => setSearch(e.target.value)}
                   />
                </div>
                <select 
                  value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}
                  className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl text-sm font-medium outline-none max-w-[100px] truncate border-transparent focus:bg-white dark:focus:bg-gray-900"
                >
                  <option value="">Hãng</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* 2. CONTENT AREA (Scrollable) */}
          <div className="flex-1 p-3 pb-24">
             {viewMode === "list" && (
                <ProductList
                  list={list} filtered={filtered} brands={brands}
                  selected={selected} 
                  setSelected={(p) => { setSelected(p); setViewMode("edit"); }}
                  listLoading={listLoading}
                  search={search} setSearch={setSearch} // Dùng search của header trên, nhưng vẫn truyền props để tránh lỗi logic con
                  selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand}
                  onRestock={(p) => { setRestockProduct(p); setRestockQty(""); setRestockModal(true); }}
                  reload={load}
                  viewType={listViewMode} 
                  gridCols={2} // Mobile Grid chỉ nên 2 cột
                />
             )}

             {/* CREATE VIEW (Mobile) */}
             {viewMode === "create" && (
               <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]">
                  <div className="flex items-center gap-2 mb-4 text-gray-500 font-medium cursor-pointer" onClick={() => setViewMode("list")}>
                     <div className="p-1 bg-gray-100 rounded-full"><FiChevronLeft /></div> Quay lại
                  </div>
                  <ProductForm load={load} />
               </motion.div>
             )}

             {/* EDIT VIEW (Mobile) */}
             {viewMode === "edit" && selected && (
               <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm min-h-[80vh]">
                  <div className="flex items-center gap-2 mb-4 text-gray-500 font-medium cursor-pointer" onClick={() => setViewMode("list")}>
                    <div className="p-1 bg-gray-100 rounded-full"><FiChevronLeft /></div> Quay lại danh sách
                  </div>
                  <ProductDetail selected={selected} setSelected={setSelected} load={load} />
               </motion.div>
             )}
          </div>
        </div>

        {/* MODALS (Global) */}
        <RestockModal open={restockModal} setOpen={setRestockModal} product={restockProduct} qty={restockQty} setQty={setRestockQty} reload={load} />
        <DeleteModal open={deleteModal} setOpen={setDeleteModal} selected={selected} reload={load} clearSelected={() => setSelected(null)} />
      </div>
    </>
  );
}