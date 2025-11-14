// tailwind.config.js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
      },

      /* 🎨 Bảng màu RC Studio */
      colors: {
        brand: {
          gold: "#d4af37",
          black: "#0d0d0d",
          dark: "#111111",
          blue: "#2f3c7e",
          neon: "#00ffff",
        },
        surface: {
          light: "#faf9f7",
          dark: "#121212",
        },
        rc: {
          gold: "#f2c94c",
          goldDark: "#d4a017",
          light: "#faf9f7",
          dark: "#1a1a1a",
        },
      },

      /* 🌈 Gradient nền */
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(90deg, #facc15 0%, #d4af37 45%, #fbbf24 100%)",
        "black-gradient": "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
        "holo-gradient":
          "linear-gradient(120deg, #ff00cc, #3333ff, #00ffff, #ffcc00)",
        "rc-gold": "linear-gradient(90deg, #f2c94c 0%, #d4a017 100%)",
        "rc-glow":
          "radial-gradient(circle at center, rgba(242,201,76,0.15) 0%, transparent 70%)",
      },

      /* 💫 Shadow & Glow */
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.08)",
        gold: "0 0 20px rgba(212, 175, 55, 0.4)",
        glow: "0 0 25px rgba(242, 201, 76, 0.4)",
        neon: "0 0 20px rgba(0, 255, 255, 0.4)",
      },

      /* 🎬 Animation Keyframes */
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(5px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 8px #f2c94c" },
          "50%": { boxShadow: "0 0 20px #d4a017" },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },

      /* ⏱️ Gán animation tiện dụng */
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s infinite linear",
        glow: "glow 2.5s ease-in-out infinite",
        slideUp: "slideUp 0.4s ease-out",
        rotate: "rotate 8s linear infinite",
      },
    },
  },

  /* 🧩 Plugins tiện ích thêm */
  plugins: [
    // Ẩn scrollbar tùy chọn
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};
