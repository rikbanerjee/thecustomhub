/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        /* "Desi Pop x Zine" palette — flat brand tokens */
        ink: '#1A1423',
        cream: '#FFF6E9',
        rani: '#D81E5B',
        marigold: '#FFB627',
        peacock: '#0F7173',
        chai: '#C9A67C',
        /* primary/secondary scales kept for existing components; remapped
           onto the new palette so untouched pages inherit the new theme
           instead of the old "Refined Heritage" brown/sage colors. */
        primary: {
          50: '#FFF6E9', // cream
          100: '#FDEFDA',
          200: '#F3E0BE',
          300: '#E5C99A',
          400: '#C9A67C', // chai
          500: '#A97F52',
          600: '#1A1423', // ink (main brand dark)
          700: '#140F1B',
          800: '#0F0B15',
          900: '#08060C',
        },
        secondary: {
          50: '#E8F4F4',
          100: '#D3E9E9',
          200: '#A6D3D3',
          300: '#7EB8B9',
          400: '#3D9799',
          500: '#14807F',
          600: '#0F7173', // peacock
          700: '#0C5A5B',
          800: '#0A4F50',
          900: '#063233',
        },
        accent: '#C9A67C', // chai
        charcoal: '#1A1423', // ink
        'light-gray': '#6a6376',
        'soft-gray': '#E6DCC8',
      },
      fontFamily: {
        heading: ['Anton', 'sans-serif'],
        body: ['"Work Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
}
