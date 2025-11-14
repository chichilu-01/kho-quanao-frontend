import { useState } from "react";
import { api } from "../../api/client";
import { notify } from "../../hooks/useToastNotify";

export default function EditCustomerForm({ customer, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone || "",
    address: customer.address || "",
    facebook_url: customer.facebook_url || "",
    notes: customer.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api(`/customers/${customer.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      notify.success("💾 Đã lưu thông tin khách hàng");
      onSaved();
    } catch (err) {
      notify.error("❌ Lỗi khi lưu khách hàng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-2 text-sm">
      <input
        className="input"
        placeholder="Tên"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        className="input"
        placeholder="Địa chỉ"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />
      <input
        className="input"
        placeholder="Facebook URL"
        value={form.facebook_url}
        onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
      />
      <textarea
        className="input"
        placeholder="Ghi chú"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />
      <div className="flex gap-2 mt-2">
        <button
          className="btn bg-green-500 hover:bg-green-600 text-white"
          onClick={save}
          disabled={saving}
        >
          💾 {saving ? "Đang lưu..." : "Lưu"}
        </button>
        <button className="btn bg-gray-300" onClick={onCancel}>
          ❌ Huỷ
        </button>
      </div>
    </div>
  );
}
