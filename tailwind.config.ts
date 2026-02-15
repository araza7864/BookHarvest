import type { Config } from "tailwindcss";

// Book Harvest color scheme - greens, oranges, warm tones from bookharvest.org
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Book Harvest brand colors - harvest green & warm orange
        harvest: {
          50: "#f0f7f4",
          100: "#d9ede3",
          200: "#b5dcc8",
          300: "#86c4a6",
          400: "#56a582",
          500: "#368a6a",
          600: "#286f55",
          700: "#225946",
          800: "#1e483a",
          900: "#1b3b31",
          950: "#0d211b",
        },
        citrus: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
