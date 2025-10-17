import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        "stellar-surface": "#06050C",
        "stellar-accent": "#3B82F6",
        "stellar-accent-soft": "#2563EB",
        "stellar-amber": "#FCD34D",
        "stellar-fuchsia": "#C084FC",
        "stellar-slate": {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2933",
          900: "#111827",
        },
      },
      boxShadow: {
        "glow-md": "0 20px 60px rgba(59, 130, 246, 0.25)",
        "glow-lg": "0 30px 80px rgba(99, 102, 241, 0.35)",
      },
      borderRadius: {
        xl: "1.25rem",
      },
      backgroundImage: {
        "stellar-hero": "radial-gradient(circle at top, rgba(59,130,246,0.45), rgba(6,5,12,0.95))",
        "stellar-hero-mesh":
          "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.6), transparent 45%), radial-gradient(circle at 80% 10%, rgba(59,130,246,0.55), transparent 40%), radial-gradient(circle at 50% 70%, rgba(244,114,182,0.4), transparent 55%)",
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config;
