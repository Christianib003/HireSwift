/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#e57cd8',
        background: '#2c1338',
        text: '#fff3f2',
        register: '#fce5d8',
      }
    },
  },
  plugins: [],
} 