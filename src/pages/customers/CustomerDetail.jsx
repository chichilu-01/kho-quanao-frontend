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
    <>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-lg">🧾 {detail.name}</h4>
        <div className="flex gap-2">
          <button
            className="btn text-xs bg-yellow-400 hover:bg-yellow-500"
            onClick={() => setEditing(true)}
          >
            ✏️ Sửa
          </button>
          <button
            className="btn text-xs bg-red-500 hover:bg-red-600 text-white"
            onClick={handleDelete}
          >
            🗑️ Xoá
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="grid grid-cols-2 gap-x-6 text-sm mb-3">
          <div className="text-gray-500">Điện thoại</div>
          <div>{detail.phone || "—"}</div>

          <div className="text-gray-500">Địa chỉ</div>
          <div>{detail.address || "—"}</div>

          <div className="text-gray-500">Facebook</div>
          <div>
            {detail.facebook_url ? (
              <a
                href={detail.facebook_url}
                target="_blank"
                className="text-blue-600 underline"
              >
                Link
              </a>
            ) : (
              "—"
            )}
          </div>

          <div className="text-gray-500">Ghi chú</div>
          <div>{detail.notes || "—"}</div>

          <div className="text-gray-500">🧮 Tổng đơn</div>
          <div className="font-semibold">{detail.total_orders} đơn</div>

          <div className="text-gray-500">💰 Chi tiêu</div>
          <div className="font-semibold text-green-600">
            {money(detail.total_spent)}
          </div>
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

      <h5 className="font-medium mb-2 mt-3">🛍️ Lịch sử mua hàng</h5>
      {detail.orders?.length === 0 ? (
        <div className="text-gray-500 text-sm">Khách chưa có đơn hàng nào.</div>
      ) : (
        <div className="space-y-3">
          {detail.orders.map((o) => (
            <div key={o.id} className="border rounded p-2 bg-gray-50 text-sm">
              <div className="flex justify-between">
                <div>Mã đơn: #{o.id}</div>
                <div>{new Date(o.created_at).toLocaleString("vi-VN")}</div>
              </div>
              <div className="mt-1 text-gray-600">
                Tổng tiền: <b>{money(o.total)}</b>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {o.items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {it.cover_image && (
                      <img
                        src={it.cover_image}
                        alt={it.product_name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    )}
                    <span>
                      {it.product_name} × {it.quantity} ({money(it.price)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
