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
          950: "#080D18",
          900: "#0D1524",
          850: "#111C30",
          800: "#16253D",
          700: "#223552",
        },
        slate: {
          950: "#0B0F17",
          900: "#0F172A",
          850: "#131D33",
          800: "#1E293B",
          700: "#334155",
        },
        brand: {
          DEFAULT: "#0D9488",
          cyan: "#06B6D4",
          teal: "#14B8A6",
          emerald: "#10B981",
          indigo: "#6366F1",
          violet: "#8B5CF6",
        },
        ink: "#F8FAFC",
        offwhite: "#F5F4EF",
        surface: {
          DEFAULT: "#0F172A",
          card: "#131D33",
          muted: "#1E293B",
          dark: "#080D18",
        },
        teal: {
          DEFAULT: "#0D9488",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          50: "#F0FDF4",
        },
        mint: "#34D399",
        amber: {
          DEFAULT: "#F59E0B",
          dark: "#D97706",
          light: "#FEF3C7",
        },
        border: "rgba(148, 163, 184, 0.12)",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)",
        glow: "0 0 25px -5px rgba(13, 148, 136, 0.35)",
        glowCyan: "0 0 25px -5px rgba(6, 182, 212, 0.35)",
        glowAmber: "0 0 25px -5px rgba(245, 158, 11, 0.35)",
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(13, 148, 136, 0.15), transparent)',
        'mesh-gradient': 'linear-gradient(to bottom right, rgba(13, 148, 136, 0.08), transparent 40%), radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.08), transparent 50%)',
      },
    },
  },
  plugins: [],
}
