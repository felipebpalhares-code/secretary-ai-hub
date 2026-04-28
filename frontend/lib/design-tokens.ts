/**
 * Design System tokens em TypeScript.
 * Espelha o que está no DESIGN_SYSTEM.md e em tailwind.config.ts.
 * Use quando precisar do valor literal (estilo inline, JS condicional, charts, etc.).
 *
 * Pra UI normal, prefira sempre as classes Tailwind dos tokens (bg-bg-surface, text-text-primary…).
 */

export const colors = {
  bg: {
    app: "#FAFAFA",
    surface: "#FFFFFF",
    subtle: "#F4F4F5",
    muted: "#E4E4E7",
  },
  border: {
    default: "#E4E4E7",
    strong: "#D4D4D8",
  },
  text: {
    primary: "#18181B",
    secondary: "#52525B",
    tertiary: "#A1A1AA",
    disabled: "#D4D4D8",
  },
  brand: {
    DEFAULT: "#1E293B",
    hover: "#0F172A",
    subtle: "#F1F5F9",
  },
  success: {
    DEFAULT: "#059669",
    subtle: "#ECFDF5",
  },
  warning: {
    DEFAULT: "#D97706",
    subtle: "#FFFBEB",
  },
  danger: {
    DEFAULT: "#DC2626",
    subtle: "#FEF2F2",
  },
  info: {
    DEFAULT: "#2563EB",
    subtle: "#EFF6FF",
  },
} as const

export const spacing = {
  tight: "8px",
  default: "12px",
  comfortable: "16px",
  relaxed: "24px",
  loose: "32px",
  section: "48px",
} as const

export const radius = {
  sm: "6px",
  default: "8px",
  md: "10px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const

export const fontSize = {
  display: { size: "2rem", weight: "600", lineHeight: "1.2" },
  title: { size: "1.5rem", weight: "600", lineHeight: "1.3" },
  subtitle: { size: "1.125rem", weight: "500", lineHeight: "1.4" },
  body: { size: "0.875rem", weight: "400", lineHeight: "1.5" },
  bodyStrong: { size: "0.875rem", weight: "500", lineHeight: "1.5" },
  small: { size: "0.8125rem", weight: "400", lineHeight: "1.5" },
  tiny: { size: "0.75rem", weight: "400", lineHeight: "1.4" },
} as const

export const shadow = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)",
  md: "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
  lg: "0 8px 16px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
} as const

export const motion = {
  duration: { fast: 150, default: 200, max: 300 },
  easing: { out: "cubic-bezier(0.16, 1, 0.3, 1)", in: "cubic-bezier(0.4, 0, 1, 1)" },
} as const

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const iconSize = {
  small: 16,
  default: 20,
  large: 24,
} as const
