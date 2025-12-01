import type { Config } from "tailwindcss";
const { heroui } = require("@heroui/react");

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        "layer-2": "#1E1E1E",
        "layer-3": "#292929",
        light: "#F7F7F7",
        "soft-light": "#AAAAAA",
        "brand-primary": "#EA2778",
        "brand-secondary": "#FFDC01",
        success: "#4CAF50",
        error: "#ED5C5C",
      },
      fontFamily: {
        sans: "var(--font-poppins)",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#EA2778",
              foreground: "#F7F7F7",
            },
            secondary: {
              DEFAULT: "#404040",
              foreground: "#F7F7F7",
              600: "#AAAAAA",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
