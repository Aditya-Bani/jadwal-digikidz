import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--background)",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--on-primary)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--on-secondary)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Stitch Generated Colors */
        "on-secondary": "var(--on-secondary)",
        "on-secondary-fixed-variant": "var(--on-secondary-fixed-variant)",
        "primary-container": "var(--primary-container)",
        "surface-dim": "var(--surface-dim)",
        "secondary-fixed": "var(--secondary-fixed)",
        "inverse-surface": "var(--inverse-surface)",
        "error": "var(--error)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        "on-surface-variant": "var(--on-surface-variant)",
        "surface-bright": "var(--surface-bright)",
        "surface-container": "var(--surface-container)",
        "on-error-container": "var(--on-error-container)",
        "on-primary-container": "var(--on-primary-container)",
        "on-error": "var(--on-error)",
        "surface-container-high": "var(--surface-container-high)",
        "on-tertiary": "var(--on-tertiary)",
        "on-background": "var(--on-background)",
        "tertiary-fixed-dim": "var(--tertiary-fixed-dim)",
        "on-secondary-fixed": "var(--on-secondary-fixed)",
        "surface": "var(--surface)",
        "surface-container-highest": "var(--surface-container-highest)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "error-container": "var(--error-container)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "on-surface": "var(--on-surface)",
        "tertiary": "var(--tertiary)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "surface-tint": "var(--surface-tint)",
        "outline": "var(--outline)",
        "on-secondary-container": "var(--on-secondary-container)",
        "inverse-primary": "var(--inverse-primary)",
        "tertiary-container": "var(--tertiary-container)",
        "secondary-container": "var(--secondary-container)",
        "on-tertiary-fixed": "var(--on-tertiary-fixed)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "outline-variant": "var(--outline-variant)",
        "on-tertiary-fixed-variant": "var(--on-tertiary-fixed-variant)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "surface-variant": "var(--surface-variant)",
        "surface-container-low": "var(--surface-container-low)",
        "tertiary-fixed": "var(--tertiary-fixed)",
        "primary-fixed": "var(--primary-fixed)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
        xl: "0.75rem",
        full: "9999px",
        "2xl": "1rem"
      },
      spacing: {
        "gutter": "24px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "base": "8px",
        "container-padding": "32px"
      },
      fontFamily: {
        "display-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-md": ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
