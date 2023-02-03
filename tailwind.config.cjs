/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  important:true,
  // prefix: 'tw-',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'green': '#02802B',
        'red': '#D11717',
      }
    },
  },
  plugins: [],
}
