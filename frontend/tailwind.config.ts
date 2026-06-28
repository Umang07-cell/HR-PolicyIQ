import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#0f172a",
          hover: "#1e293b",
          active: "#1e40af",
          border: "#1e293b",
          text: "#94a3b8",
          "text-muted": "#64748b",
          "text-active": "#f8fafc",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
          border: "#e2e8f0",
          "border-strong": "#cbd5e1",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
        "card-active": "0 1px 2px 0 rgba(0,0,0,0.04), 0 0 0 2px rgba(59,130,246,0.15)",
        sidebar: "1px 0 0 0 #1e293b",
        elevated: "0 8px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)",
        modal: "0 20px 60px -10px rgba(0,0,0,0.25)",
        "brand-glow": "0 0 0 3px rgba(59,130,246,0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "slide-in-right": "slideInRight 0.2s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer: "shimmer 1.5s infinite",
        "page-enter": "pageEnter 0.2s ease-out forwards",
        "bounce-x": "bounceX 1s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pageEnter: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceX: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(3px)" },
        },
        shrink: {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      spacing: {
        "sidebar": "15rem",
        "sidebar-collapsed": "3.5rem",
        "navbar": "3.5rem",
      },
      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
