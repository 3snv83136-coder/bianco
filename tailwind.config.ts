import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette extraite de bianco-esthetique.fr
        primary: {
          DEFAULT: "#C9A77C",
          50: "#FAF6F1",
          100: "#F3EBE0",
          200: "#E6D5BE",
          300: "#D9BF9D",
          400: "#C9A77C",
          500: "#B8925E",
          600: "#9A7649",
          700: "#7C5D3A",
          800: "#5E452C",
          900: "#402F1E",
        },
        dark: {
          DEFAULT: "#121212",
          70: "rgba(18, 18, 18, 0.7)",
          80: "rgba(18, 18, 18, 0.8)",
          90: "rgba(18, 18, 18, 0.9)",
        },
        background: "#FFFFFF",
        surface: "#FCFBFA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(18, 18, 18, 0.06)",
        soft: "0 2px 12px rgba(201, 167, 124, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
