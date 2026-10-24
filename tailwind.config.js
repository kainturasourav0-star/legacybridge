/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#09101C",
          900: "#0F1A2B",
          800: "#16253D",
          700: "#223552",
        },
        ink: "#111C2E",
        offwhite: "#F5F4EF",
        surface: {
          DEFAULT: "#FDFCF8",
          card: "#FFFFFF",
          muted: "#F3F1E8",
        },
        teal: {
          DEFAULT: "#0E7C6F",
          600: "#0E7C6F",
          700: "#0A5B52",
          50: "#F0FDF4",
        },
        mint: "#4FE0C8",
        amber: {
          DEFAULT: "#F2B84B",
          dark: "#B7791F",
          light: "#FEFCBF",
        },
        border: "hsl(214.3 31.8% 91.4%)",
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(15, 26, 43, 0.05), 0 1px 2px 0 rgba(15, 26, 43, 0.03)",
        card: "0 4px 6px -1px rgba(15, 26, 43, 0.06), 0 2px 4px -1px rgba(15, 26, 43, 0.04)",
      },
    },
  },
  plugins: [],
}
