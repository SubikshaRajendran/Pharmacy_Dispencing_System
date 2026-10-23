/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pharmacy: {
          dark: '#0B4D3C',
          deep: '#06382B',
          light: '#0F614C',
          lime: '#D4F037',
          brightLime: '#CCFF00',
          accent: '#A3E635',
          bgLight: '#F8FAFC',
          cardBg: '#F1F5F9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
