import { useState, useEffect } from "react";
import { FiUser, FiSearch, FiX } from "react-icons/fi";

export default function OrderCustomerForm({
  customers,
  isNewCustomer,
  setIsNewCustomer,
  newCustomer,
  setNewCustomer,
  customerId,
  setCustomerId,
}) {
  // State riêng để lưu từ khóa tìm kiếm (không ảnh hưởng đến customerId)
  const [searchTerm, setSearchTerm] = useState("");

  // Logic lọc khách hàng: Tìm theo Tên hoặc Số điện thoại
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchName = c.name?.toLowerCase().includes(term);
    const matchPhone = c.phone?.includes(term);
    return matchName || matchPhone;
  });

  // Effect: Khi chuyển sang "Tạo mới", reset ID cũ
  useEffect(() => {
    if (isNewCustomer) {
      setCustomerId("");
    }
  }, [isNewCustomer, setCustomerId]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
        <FiUser className="text-blue-500" /> Khách hàng
      </h3>

      {/* Toggle: Khách cũ / Mới */}
      <div className="flex items-center gap-2 mb-4 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
        <button
          onClick={() => setIsNewCustomer(false)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            !isNewCustomer
              ? "bg-white dark:bg-gray-600 shadow text-blue-600 font-semibold"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Chọn có sẵn
        </button>
        <button
          onClick={() => setIsNewCustomer(true)}
          className={`px-3 py-1.5 text-sm rounded-md transition-all ${
            isNewCustomer
              ? "bg-white dark:bg-gray-600 shadow text-blue-600 font-semibold"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          + Tạo mới
        </button>
      </div>

      {!isNewCustomer ? (
        /* --- TRƯỜNG HỢP 1: CHỌN KHÁCH CŨ --- */
        <div className="space-y-3 animate-fadeIn">
          {/* Ô tìm kiếm thông minh */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              placeholder="Gõ tên hoặc SĐT để tìm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Dropdown danh sách đã lọc */}
          <select
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:border-blue-500"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            size={filteredCustomers.length > 5 ? 5 : undefined} // Nếu nhiều khách thì hiện dạng list box, ít thì dropdown thường
          >
            <option value="">
              {filteredCustomers.length === 0
                ? "❌ Không tìm thấy khách nào"
                : "-- Chọn khách hàng từ danh sách --"}
            </option>
            {filteredCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.phone || "Không có SĐT"}
              </option>
            ))}
          </select>

          {/* Gợi ý nếu không tìm thấy */}
          {searchTerm && filteredCustomers.length === 0 && (
            <div className="text-sm text-center text-gray-500 mt-2">
              Không tìm thấy khách hàng nào. <br />
              <button
                onClick={() => setIsNewCustomer(true)}
                className="text-blue-600 hover:underline font-semibold"
              >
                Tạo khách hàng mới ngay?
              </button>
            </div>
          )}
        </div>
      ) : (
        /* --- TRƯỜNG HỢP 2: NHẬP KHÁCH MỚI --- */
        <div className="grid gap-3 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Tên khách *
              </label>
              <input
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700"
                placeholder="Nhập tên..."
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Số điện thoại *
              </label>
              <input
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700"
                placeholder="Nhập SĐT..."
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Địa chỉ
            </label>
            <input
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700"
              placeholder="Số nhà, đường, quận/huyện..."
              value={newCustomer.address}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, address: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Facebook URL (Tùy chọn)
            </label>
            <input
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700"
              placeholder="https://facebook.com/..."
              value={newCustomer.facebook_url}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, facebook_url: e.target.value })
              }
            />
          </div>

          <textarea
            className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-900 dark:border-gray-700"
            placeholder="Ghi chú thêm về khách..."
            rows={2}
            value={newCustomer.notes}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, notes: e.target.value })
            }
          />
        </div>
      )}
    </div>
  );
}
