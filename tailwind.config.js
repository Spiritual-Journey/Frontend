/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ead9c0',
          300: '#dec297',
          400: '#d1a46b',
          500: '#c58a46',
          600: '#b87239',
          700: '#995830',
          800: '#7f492b',
          900: '#663c25',
          950: '#381e11',
        },
        secondary: {
          50: '#fdfaed',
          100: '#faf2d1',
          200: '#f5e3a3',
          300: '#efce6c',
          400: '#ebba40',
          500: '#e3a11f',
          600: '#c77e16',
          700: '#a55c15',
          800: '#874817',
          900: '#713b16',
          950: '#411e07',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [],
}
