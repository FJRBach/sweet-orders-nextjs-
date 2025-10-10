/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
    
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // ¡Añadido para el App Router!
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./App.{js,ts,jsx,tsx}",
    "./main.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        // Colores de la marca personalizados
        'brand': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      }
    },
  },
  plugins: [],
};