/ ** @type {import('tailwindcss').Config} * /
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        crimson: "#C41E3A",
        "crimson-dark": "#9B1B2F",
        charcoal: "#1C1C1E",
        "gray-dark": "#2C2C2E",
        "gray-mid": "#3A3A3C",
        "gray-light": "#8E8E93",
        success: "#30D158"
      }
    }
  },
  plugins: []
};
