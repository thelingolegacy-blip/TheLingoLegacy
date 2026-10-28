import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        crimson: { DEFAULT: "#C41E3A", dark: "#9B1B2F", soft: "#F8E7EB" },
        charcoal: { DEFAULT: "#1C1C1E", light: "#2C2C2E", panel: "#242427" },
        ink: { muted: "#A1A1AA", faint: "#71717A" }
      },
      boxShadow: { crimson: "0 8px 30px rgba(196, 30, 58, 0.22)" },
      backgroundImage: { "hero-glow": "radial-gradient(ellipse at top, rgba(196,30,58,.18), transparent 58%)" }
    }
  },
  plugins: []
};

export default config;
