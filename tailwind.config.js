/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {

    },
    extend: {
      colors: {
        text: '#212121',
        background: '#f2f2f2',
        primary: '#dda713',
        secondary: '#3E3E3E',
        accent: '#fcde93',
        facebook: '#39569C'
      }
    },
  },
  plugins: [],
}