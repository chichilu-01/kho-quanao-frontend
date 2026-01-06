import React from "react";

export default function ProductSkeleton({ viewType = "list" }) {
  // Tạo mảng giả 6 phần tử để hiển thị 6 dòng đang load
  const items = Array(6).fill(0);

  return (
    <div
      className={`grid gap-3 ${viewType === "grid" ? "grid-cols-2" : "grid-cols-1"}`}
    >
      {items.map((_, i) => (
        <div
          key={i}
          // animate-pulse: tạo hiệu ứng nhấp nháy mờ ảo
          className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-3 animate-pulse"
        >
          {/* Khung giả lập Ảnh */}
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0"></div>

          {/* Khung giả lập Thông tin */}
          <div className="flex-1 space-y-2 py-1">
            {/* Giả lập Tên SP */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            {/* Giả lập SKU */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

            <div className="flex justify-between items-end pt-2">
              {/* Giả lập Giá tiền */}
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              {/* Giả lập Nút bấm */}
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
