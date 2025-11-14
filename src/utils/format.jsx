// src/utils/format.js

// 💰 Định dạng tiền tệ VNĐ (hiển thị đẹp, bỏ .00, vẫn tính đúng)
export function money(value) {
  if (value == null || isNaN(value)) return "0 ₫";
  const number = Math.round(Number(value)); // ✨ bỏ phần .00
  return number.toLocaleString("vi-VN") + " ₫";
}

// 📅 Định dạng ngày kiểu Việt Nam (ngắn gọn)
export function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("vi-VN");
}

// 🔢 Rút gọn số (ví dụ: 1.2K, 3.4M)
export function shortNumber(num) {
  if (num == null || isNaN(num)) return "0";
  if (num >= 1_000_000)
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}
