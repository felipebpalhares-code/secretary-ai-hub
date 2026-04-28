import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ─── Tokens existentes (compat com telas atuais) ───
        bg: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          // Design System
          app: "#FAFAFA",
          surface: "#FFFFFF",
          subtle: "#F4F4F5",
          muted: "#E4E4E7",
        },
        card: "rgb(var(--card) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
          4: "rgb(var(--ink-4) / <alpha-value>)",
        },
        hair: {
          DEFAULT: "rgb(var(--hair) / <alpha-value>)",
          2: "rgb(var(--hair-2) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          soft: "rgb(var(--accent-soft) / <alpha-value>)",
        },
        ok: "rgb(var(--ok) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        err: "rgb(var(--err) / <alpha-value>)",

        // ─── Novos tokens do Design System ───
        text: {
          primary: "#18181B",
          secondary: "#52525B",
          tertiary: "#A1A1AA",
          disabled: "#D4D4D8",
        },
        border: {
          default: "#E4E4E7",
          strong: "#D4D4D8",
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
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "SF Pro Text", "system-ui", "sans-serif"],
        mono: ["-apple-system-ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        // Existente
        xs2: "10.5px",
        // Design System (size + { lineHeight, fontWeight })
        display: ["2rem", { lineHeight: "1.2", fontWeight: "600" }],
        title: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        subtitle: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-strong": ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],
        small: ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        tiny: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      borderRadius: {
        xs: "6px",
        sm: "7px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        // Sombras sutis (sobrescreve xs/sm/md/lg padrão Tailwind por versões mais discretas)
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)",
        md: "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg: "0 8px 16px -4px rgb(0 0 0 / 0.08), 0 4px 8px -4px rgb(0 0 0 / 0.04)",
      },
      spacing: {
        tight: "8px",
        comfortable: "16px",
        relaxed: "24px",
        loose: "32px",
        section: "48px",
      },
      transitionDuration: {
        fast: "150ms",
      },
    },
  },
  plugins: [],
} satisfies Config
