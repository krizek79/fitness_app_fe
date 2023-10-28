/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#212121',
        background: '#f2f2f2',
        primary: '#dda713',
        secondary: '#212121',
        accent: '#fae8b4'
      }
    },
  },
  plugins: [],
}