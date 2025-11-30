import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";
import EditCustomerForm from "./EditCustomerForm";

function money(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

export default function CustomerDetail({
  detail,
  setEditing,
  editing,
  viewDetail,
  setDetail,
  setSelected,
  loadList,
}) {
  const handleDelete = async () => {
    const ok = await notify.confirm(
      `Bạn chắc chắn muốn xoá khách "${detail.name}"?`,
    );
    if (!ok) return;
    try {
      await api(`/customers/${detail.id}`, { method: "DELETE" });
      notify.success("🗑️ Đã xoá khách hàng");
      setDetail(null);
      setSelected(null);
      loadList();
    } catch {
      notify.error("❌ Lỗi khi xoá khách hàng");
    }
  };

  return (
    <div className="pb-[75px] sm:pb-4">
      {" "}
      {/* ⬅ đảm bảo không bị che bởi bottom bar */}
      <div
        className="p-4 rounded-2xl bg-white shadow-sm border border-gray-200 
                    dark:bg-gray-900 dark:border-gray-700"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-xl text-gray-800 dark:text-white flex items-center gap-2">
            🧾 {detail.name}
          </h4>

          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-yellow-300 hover:bg-yellow-400 
                       transition shadow-sm"
              onClick={() => setEditing(true)}
            >
              ✏️ Sửa
            </button>

            <button
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500 hover:bg-red-600 
                       text-white transition shadow-sm"
              onClick={handleDelete}
            >
              🗑️ Xoá
            </button>
          </div>
        </div>

        {/* INFO */}
        {!editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-4">
            <InfoRow label="📞 Điện thoại" value={detail.phone} />
            <InfoRow label="📍 Địa chỉ" value={detail.address} />
            <InfoRow
              label="🌐 Facebook"
              value={
                detail.facebook_url ? (
                  <a
                    href={detail.facebook_url}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Link
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow label="📝 Ghi chú" value={detail.notes} />
            <InfoRow label="🧮 Tổng đơn" value={`${detail.total_orders} đơn`} />
            <InfoRow
              label="💰 Chi tiêu"
              value={
                <span className="font-semibold text-green-600">
                  {money(detail.total_spent)}
                </span>
              }
            />
          </div>
        ) : (
          <EditCustomerForm
            customer={detail}
            onCancel={() => setEditing(false)}
            onSaved={async () => {
              await viewDetail(detail);
              setEditing(false);
              loadList();
            }}
          />
        )}

        {/* LỊCH SỬ ĐƠN */}
        <h5 className="font-semibold mb-3 text-lg text-gray-800 dark:text-white">
          🛍️ Lịch sử mua hàng
        </h5>

        {detail.orders?.length === 0 ? (
          <div className="text-gray-500 text-sm">
            Khách chưa có đơn hàng nào.
          </div>
        ) : (
          <div className="space-y-3">
            {detail.orders.map((o) => (
              <div
                key={o.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm 
                         dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex justify-between text-sm">
                  <div className="font-medium">Mã đơn: #{o.id}</div>
                  <div className="text-gray-500 dark:text-gray-300">
                    {new Date(o.created_at).toLocaleString("vi-VN")}
                  </div>
                </div>

                <div className="mt-1 text-gray-700 dark:text-gray-300">
                  Tổng tiền: <b>{money(o.total)}</b>
                </div>

                {/* ITEMS */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {it.cover_image && (
                        <img
                          src={it.cover_image}
                          alt={it.product_name}
                          className="w-12 h-12 rounded-lg border object-cover shadow-sm"
                        />
                      )}
                      <span className="text-gray-800 dark:text-gray-200 text-sm">
                        {it.product_name} × {it.quantity} ({money(it.price)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 👉 COMPONENT NHỎ GIÚP GIAO DIỆN ĐẸP & GỌN */
function InfoRow({ label, value }) {
  return (
    <>
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="font-medium text-gray-700 dark:text-gray-200">
        {value || "—"}
      </div>
    </>
  );
}
