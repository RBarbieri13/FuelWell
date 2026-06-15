// FuelWell Design Tokens — FW.zip Lagoon & Coral system
export const colors = {
  // Primary - Lagoon
  primary: {
    50: "#edf8f5",
    100: "#d6f0e8",
    200: "#aee2d3",
    300: "#7bd1b9",
    400: "#45bf9c",
    500: "#1eae84",
    600: "#15916c",
    700: "#117558",
    800: "#0e5d48",
    900: "#0a4436",
  },
  // Accent - Coral
  accent: {
    50: "#fff1ed",
    100: "#ffe0d8",
    200: "#ffc3b5",
    300: "#f7a08d",
    400: "#f0795b",
    500: "#df6345",
    600: "#c74f33",
    700: "#9f3e28",
    800: "#7d3828",
    900: "#5e271b",
  },
  // Neutrals
  neutral: {
    50: "#f7faf8",
    100: "#eef4f1",
    200: "#dbe3df",
    300: "#c7d4ce",
    400: "#9db0aa",
    500: "#7c968f",
    600: "#54635d",
    700: "#3a4a44",
    800: "#243832",
    900: "#16302a",
    950: "#0b1d19",
  },
  // Semantic
  success: "#1eae84",
  warning: "#c7a91e",
  error: "#ef4444",
  info: "#3e92c9",
  // Macros
  protein: "#1eae84",
  carbs: "#c7a91e",
  fat: "#8e73bd",
  calories: "#1eae84",
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const typography = {
  fontFamily: {
    sans: '"Hanken Grotesk", system-ui, -apple-system, sans-serif',
    display: '"Quicksand", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
} as const;
