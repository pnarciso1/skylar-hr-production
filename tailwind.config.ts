import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

// Design tokens: docs/SKYLAR_ENGINEERING_ARCHITECTURE_v4.md §46, §134.
// `theme.colors` (not `extend`) on purpose: the default palette is dropped so
// off-system colors (blue, gray, white) cannot be used by accident.
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ink: { DEFAULT: "#0B0B0E", 2: "#15151B", 3: "#1F1F27" },
      paper: { DEFAULT: "#F2EFE8", 2: "#B4B0A6", 3: "#7E7B74" },
      attention: "#F2A93B",
      risk: "#FF4A45",
      success: "#4CD07D",
      hairline: "rgba(242, 239, 232, 0.12)",
    },
    extend: {
      // Font choice is pending design sign-off (§47); swap the families here only.
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
export default config;
