/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* shadcn semantic tokens */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* PGI brand colors */
        dark: '#354657',
        light: '#f5f5f5',

        /* Unified navy color system - matches CSS variables */
        navy: '#0a1628',           /* Primary navy - matches PGI logo bg */
        'navy-primary': '#0a1628', /* Alias for clarity */
        'navy-alternate': '#0a192f', /* Lighter navy for alternating sections */
        'navy-sidebar': '#001e38', /* Dashboard sidebar */
        'navy-accent': '#002C4D',  /* User info sections */
        'navy-border': '#003E6B',  /* Borders on navy backgrounds */
        'navy-light': '#0a192f',   /* Legacy alias */
        'navy-hover': '#0d1e35',   /* Hover state on navy */

        /* Other colors */
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

        /* PGI branded blues */
        'pgi-dark-blue': '#0A192F',
        'pgi-light-blue': '#1F2A44',
        'pgi-accent-blue': '#1F3A5F',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
