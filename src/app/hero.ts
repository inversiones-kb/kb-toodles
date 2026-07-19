// hero.ts
import { heroui } from "@heroui/react";
export default heroui({
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
});
