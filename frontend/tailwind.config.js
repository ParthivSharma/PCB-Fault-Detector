/** @type {import('tailwindcss').Config} */
const path = require("path");

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a"
      }
    },
  },
  plugins: [],
};
