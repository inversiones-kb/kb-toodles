// hero.ts
import { heroui } from "@heroui/react";
// or import from theme package if you are using individual packages.
// import { heroui } from "@heroui/theme";
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
