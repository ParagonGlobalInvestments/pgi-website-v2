/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4A6BB1',
        secondary: '#adb5bd',
        dark: '#354657',
        light: '#f5f5f5',
        gray: '#6c757d',
        navy: '#00172B',
        'navy-light': '#001e38',
        'navy-hover': '#00213f',
        'navy-border': '#002a52',
        'navy-accent': '#0053a3',
        lightNavy: '#002642',
        darkNavy: '#000F1D',
        lightGray: '#E5E5E5',
        darkGray: '#333333',
        lightBlue: '#007BFF',
        darkBlue: '#004080',
        lightGreen: '#28A745',
        darkGreen: '#1E7E34',
        lightRed: '#DC3545',
        darkRed: '#C82333',
        'pgi-dark-blue': '#0A192F',
        'pgi-accent-blue': '#1F3A5F',
      },
      fontFamily: {
        sans: [
          'var(--font-montserrat)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
