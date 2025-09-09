/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial"],
      },
      colors: {
        bg: "#FFFFFF",
        surface: "#FAF8F5",
        surface2: "#F0ECE7",
        text: "#1C1A19",
        dim: "#58524D",
        line: "#D9D3CC",
        outline: "#B8AEA5",
        sky: "#AFCBFF",
        honey: "#E8DCA8",
        burgundy: "#A95056",
        choco: "#6B4B3E",
        success: "#86C8BC",
        warn: "#E1A177",
        danger: "#E57C73",
      },
      boxShadow: {
        thin: "0 1px 0 rgba(0,0,0,.08), 0 0 0 1px var(--tw-outline)",
        card: "0 2px 8px rgba(0,0,0,.10), 0 0 0 1px var(--tw-outline)",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      backdropBlur: {
        xs: "6px",
        sm: "10px",
        md: "14px",
      },
      keyframes: {
        "spring-in": {
          "0%": { transform: "scale(.96)", opacity: "0" },
          "60%": { transform: "scale(1.02)", opacity: ".9" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
      },
      animation: {
        "spring-in": "spring-in 320ms cubic-bezier(.2,.8,.2,1) both",
        "fade-in": "fade-in 240ms ease-out both",
        "slide-up": "slide-up 240ms cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};