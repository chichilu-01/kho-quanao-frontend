import toast from "react-hot-toast";

export const notify = {
  success: (msg, opts = {}) =>
    toast.success(msg, {
      ...opts,
      style: {
        borderRadius: "12px",
        background: "#10b981",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: "500",
        padding: "10px 16px",
        ...opts.style,
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    }),

  error: (msg, opts = {}) =>
    toast.error(msg, {
      ...opts,
      style: {
        borderRadius: "12px",
        background: "#ef4444",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: "500",
        padding: "10px 16px",
        ...opts.style,
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    }),

  info: (msg, opts = {}) =>
    toast(msg, {
      ...opts,
      style: {
        borderRadius: "12px",
        background: "#3b82f6",
        color: "#fff",
        fontSize: "0.95rem",
        fontWeight: "500",
        padding: "10px 16px",
        ...opts.style,
      },
      icon: "ℹ️",
    }),
};
