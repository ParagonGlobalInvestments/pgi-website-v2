/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4A6BB1",
        secondary: "#FBB040",
        dark: "#354657",
        light: "#f5f5f5",
        gray: "#6c757d",
        navy: "#00172B",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
