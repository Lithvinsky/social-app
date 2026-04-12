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
          DEFAULT: "#F7F5FF",
          muted: "#E8E4F5",
        },
        lavender: {
          light: "#C7B8FF",
          deep: "#BFA8FF",
          mist: "#EDE8FF",
        },
        brand: {
          DEFAULT: "#6A4FBF",
          hover: "#5a42a8",
          muted: "#8b6fd4",
          deep: "#4A2F8C",
        },
        orbit: {
          ink: "#2D1B4E",
          muted: "#5C4A7A",
          /** Lavender in theme PNG / wordmark (pairs with orbit-logo.png) */
          glyph: "#B19CFF",
        },
      },
      boxShadow: {
        soft: "0 1px 3px rgba(106, 79, 191, 0.08)",
        card: "0 8px 32px rgba(106, 79, 191, 0.12)",
        nav: "0 4px 24px rgba(74, 47, 140, 0.08)",
        orbit: "0 12px 40px rgba(106, 79, 191, 0.18)",
        glow: "0 0 0 1px rgba(255,255,255,0.5), 0 8px 32px rgba(106, 79, 191, 0.15)",
      },
      backgroundImage: {
        "orbit-shine":
          "radial-gradient(ellipse 100% 80% at 50% -30%, rgba(199, 184, 255, 0.55) 0%, transparent 55%)",
      },
    },
  },
  plugins: [],
};
