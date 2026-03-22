/**
 * FuelWell Design Tokens — Single source of truth
 * All brand constants referenced from docs/04-brand-identity.md
 *
 * Usage: import from this file instead of hardcoding hex values.
 * CSS variables in globals.css mirror these values for Tailwind use.
 */

export const colors = {
  // Primary brand
  orange: "#E87A1D",
  green: "#3D9B2F",
  accent: "#00D278",

  // Backgrounds
  background: "#0A0A0F",
  surface: "#111118",
  elevated: "#1A1A24",
  border: "#2A2A3A",

  // Text
  textPrimary: "#FFFFFF",
  textBody: "#E0E0E0",
  textSecondary: "#999999",
  textMuted: "#777777",
  textDisabled: "#555555",

  // Semantic
  success: "#00D278",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#00B4D8",
  premium: "#A855F7",
} as const;

export const gradients = {
  brand: "linear-gradient(135deg, #E87A1D, #00D278)",
  header: "linear-gradient(135deg, #1A1A2E, #16213E)",
  premiumGlow: "linear-gradient(135deg, #2A1A3E, #1A2A3E)",
  text: "linear-gradient(90deg, #00D278, #00B4D8)",
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
} as const;

export const animation = {
  cardHover: { duration: 200, easing: "ease" },
  buttonHover: { duration: 150, easing: "ease-out" },
  fadeIn: { duration: 400, easing: "ease-out" },
  countUp: { duration: 800, easing: "ease-out" },
  pulse: { duration: 300, easing: "ease-in-out" },
} as const;
