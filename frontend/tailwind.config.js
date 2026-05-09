/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      colors: {
        surface: {
          DEFAULT: "#F0F5FC",
          muted: "#E2EAF5",
        },
        /** Named historically; values are cool blues for gradients & accents */
        lavender: {
          light: "#93C5FD",
          deep: "#3B82F6",
          mist: "#DBEAFE",
        },
        brand: {
          DEFAULT: "#1D4ED8",
          hover: "#1E40AF",
          muted: "#3B82F6",
          deep: "#1E3A8A",
        },
        orbit: {
          ink: "#0F172A",
          muted: "#64748B",
          /** Decorative glow / glyph tint (pairs with orbit-logo.png) */
          glyph: "#38BDF8",
        },
      },
      boxShadow: {
        soft: "0 1px 3px rgba(30, 64, 175, 0.09)",
        card: "0 8px 32px rgba(30, 64, 175, 0.14)",
        nav: "0 4px 24px rgba(30, 58, 138, 0.09)",
        orbit: "0 12px 40px rgba(30, 64, 175, 0.2)",
        glow: "0 0 0 1px rgba(255,255,255,0.5), 0 8px 32px rgba(30, 64, 175, 0.16)",
      },
      backgroundImage: {
        "orbit-shine":
          "radial-gradient(ellipse 100% 80% at 50% -30%, rgba(147, 197, 253, 0.45) 0%, transparent 55%)",
      },
    },
  },
  plugins: [],
};
