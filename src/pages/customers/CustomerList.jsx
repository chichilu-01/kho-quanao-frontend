import CustomerDetail from "./CustomerDetail";

export default function CustomerList({
  filtered,
  selected,
  setSelected,
  viewDetail,
  search,
  setSearch,
  loadList,
  detail,
  setDetail,
  editing,
  setEditing,
  loadingDetail,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border shadow-sm overflow-hidden">
      <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
        📋 Danh sách khách hàng
      </h3>

      {/* Tìm kiếm */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Tìm theo tên hoặc số điện thoại…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
        <button
          className="btn text-sm bg-gray-100 hover:bg-gray-200"
          onClick={() => {
            setSearch("");
            loadList();
          }}
        >
          Làm mới
        </button>
      </div>

      {/* Danh sách */}
      <div className="overflow-auto max-h-72 border rounded relative z-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr className="text-left">
              <th className="p-2">Tên</th>
              <th className="p-2">Điện thoại</th>
              <th className="p-2">Facebook</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className={`border-t cursor-pointer hover:bg-gray-50 ${
                  selected?.id === c.id ? "bg-gray-100" : ""
                }`}
              >
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.phone || "—"}</td>
                <td className="p-2">
                  {c.facebook_url ? (
                    <a
                      className="text-blue-600 underline"
                      href={c.facebook_url}
                      target="_blank"
                    >
                      Link
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-right">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => viewDetail(c)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={4}>
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Panel chi tiết 
      <div className="mt-5 border-t pt-4">
        {!selected ? (
          <div className="text-gray-500">
            Chọn “Chi tiết” để xem thông tin & lịch sử mua.
          </div>
        ) : loadingDetail ? (
          <div className="text-gray-500">Đang tải chi tiết…</div>
        ) : !detail ? (
          <div className="text-red-600">Không lấy được chi tiết khách hàng.</div>
        ) : (
          <CustomerDetail
            detail={detail}
            setEditing={setEditing}
            editing={editing}
            viewDetail={viewDetail}
            setDetail={setDetail}
            setSelected={setSelected}
            loadList={loadList}
          />
        )}
      </div>*/}
    </div>
  );
}
