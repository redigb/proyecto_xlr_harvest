/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'luckiest': ['"Luckiest Guy"', 'cursive'],  // Tu fuente
      },
    },
  },
  plugins: [],
}