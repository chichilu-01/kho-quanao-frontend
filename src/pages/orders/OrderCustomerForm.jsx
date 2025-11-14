// src/pages/orders/OrderCustomerForm.jsx
import { FiUser, FiSearch } from "react-icons/fi";

export default function OrderCustomerForm({
  customers,
  isNewCustomer,
  setIsNewCustomer,
  newCustomer,
  setNewCustomer,
  customerId,
  setCustomerId,
}) {
  return (
    <div>
      <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-700">
        <FiUser className="text-blue-500" /> Khách hàng
      </h3>

      <label className="flex items-center gap-2 text-sm mb-3">
        <input
          type="checkbox"
          checked={isNewCustomer}
          onChange={(e) => setIsNewCustomer(e.target.checked)}
        />
        <span>Tạo khách hàng mới</span>
      </label>

      {!isNewCustomer ? (
        <>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="     Tìm khách hàng..."
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>

          <select
            className="input w-full mt-2"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value=""> -- Chọn khách hàng -- </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </>
      ) : (
        <div className="grid gap-2 mb-3">
          {["name", "phone", "facebook_url", "address"].map((key) => (
            <input
              key={key}
              className="input"
              placeholder={
                key === "name"
                  ? "Tên khách hàng"
                  : key === "phone"
                    ? "Số điện thoại"
                    : key === "facebook_url"
                      ? "Facebook URL"
                      : "Địa chỉ"
              }
              value={newCustomer[key]}
              onChange={(e) =>
                setNewCustomer({ ...newCustomer, [key]: e.target.value })
              }
            />
          ))}
          <textarea
            className="input"
            placeholder="Ghi chú"
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
