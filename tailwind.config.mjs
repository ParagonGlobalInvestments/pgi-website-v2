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
        lightNavy: "#002642",
        darkNavy: "#000F1D",
        lightGray: "#E5E5E5",
        darkGray: "#333333",
        lightBlue: "#007BFF",
        darkBlue: "#004080",
        lightGreen: "#28A745",
        darkGreen: "#1E7E34",
        lightRed: "#DC3545",
        darkRed: "#C82333",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
