import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b1220",
          900: "#101a2e",
          800: "#16233d",
          700: "#1f3054",
        },
        brand: {
          50: "#eef6f4",
          100: "#d7ebe6",
          300: "#7fc4b4",
          500: "#2e9d84",
          600: "#23806c",
          700: "#1c6656",
        },
        gold: {
          300: "#e8cf9a",
          400: "#ddb96f",
          500: "#c9a24e",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 18, 32, 0.06), 0 8px 24px rgba(11, 18, 32, 0.08)",
        panel: "0 2px 6px rgba(11, 18, 32, 0.05), 0 16px 40px rgba(11, 18, 32, 0.1)",
      },
      keyframes: {
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" },
        },
        riseIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.2s infinite ease-in-out",
        riseIn: "riseIn 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
