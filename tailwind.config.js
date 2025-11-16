/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        /* Refined Heritage palette mapped into Tailwind tokens */
        primary: {
          50: '#fffbf5', // warm white
          100: '#faf7f2', // cream
          200: '#e8e4df', // soft gray
          300: '#d6cbbd',
          400: '#c9a67c', // golden tan accent
          500: '#8b7355', // warm taupe
          600: '#2c1810', // deep brown (primary brand)
          700: '#24120b',
          800: '#1b0e08',
          900: '#120804',
        },
        secondary: {
          50: '#f5f7f3',
          100: '#e3eadc',
          200: '#c7d4b9',
          300: '#9caf88', // sage green
          400: '#7f986d',
          500: '#627c53',
          600: '#4c6142',
          700: '#394933',
          800: '#273324',
          900: '#182017',
        },
        accent: '#c9a67c',
        charcoal: '#3a3a3a',
        'light-gray': '#6b6b6b',
        'soft-gray': '#e8e4df',
      },
      fontFamily: {
        heading: ['"Cormorant Garamond"', 'Times New Roman', 'serif'],
        body: ['"Work Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
}
