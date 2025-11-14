import { notify } from "../hooks/useToastNotify";

const BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://kho-quanao-backend-production.up.railway.app/api";

export async function api(path, options = {}) {
  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ API error:", res.status, text);

      // ✅ Hiển thị toast lỗi chung
      notify.error(`Lỗi ${res.status}: ${text || "Không thể kết nối máy chủ"}`);
      throw new Error(text);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    notify.error("🚫 Lỗi kết nối server, vui lòng thử lại!");
    throw err;
  }
}
