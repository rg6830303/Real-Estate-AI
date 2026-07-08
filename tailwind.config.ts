import type { Config } from "tailwindcss";

/**
 * Radiance Realtors brand tokens — the ONLY place site colors are defined.
 * To match the client's exact shades, adjust these hex values and every
 * component follows. Palette: near-black luxury base, radiant gold accent,
 * warm cream canvas.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0e0d0b",
          900: "#171512",
          800: "#221f1a",
          700: "#332e26",
        },
        // Accent family (buttons, highlights, progress) — radiant gold.
        brand: {
          50: "#faf5e9",
          100: "#f3e8cd",
          300: "#dfc389",
          500: "#c9a24e",
          600: "#ab8639",
          700: "#8a6b2c",
        },
        gold: {
          300: "#e8cf9a",
          400: "#ddb96f",
          500: "#c9a24e",
        },
        cream: {
          50: "#faf8f4",
          100: "#f4f0e8",
          200: "#e9e2d4",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 13, 11, 0.06), 0 8px 24px rgba(14, 13, 11, 0.08)",
        panel: "0 2px 6px rgba(14, 13, 11, 0.05), 0 16px 40px rgba(14, 13, 11, 0.1)",
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
        // Slow zoom/pan for the hero slideshow backgrounds (video-like motion).
        kenburns: {
          "0%": { transform: "scale(1.08) translate(0, 0)" },
          "100%": { transform: "scale(1.22) translate(-2%, -2%)" },
        },
        // Continuous horizontal scroll for the builder logo marquee.
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.2s infinite ease-in-out",
        riseIn: "riseIn 0.25s ease-out",
        kenburns: "kenburns 12s ease-out forwards",
        marquee: "marquee 32s linear infinite",
        fadeIn: "fadeIn 0.8s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
