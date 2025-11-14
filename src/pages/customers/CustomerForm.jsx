export default function CustomerForm({ form, setForm, submit }) {
  return (
    <div className="bg-white p-4 rounded-2xl border shadow-sm">
      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
        🧍‍♀️ Thêm khách hàng
      </h3>
      <form onSubmit={submit} className="grid gap-2">
        <input
          className="input"
          placeholder="Tên *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="input"
          placeholder="Facebook URL"
          value={form.facebook_url}
          onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
        />
        <input
          className="input"
          placeholder="Địa chỉ"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Ghi chú"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button className="btn bg-blue-600 hover:bg-blue-700 text-white">
          ➕ Thêm khách hàng
        </button>
      </form>
    </div>
  );
}
