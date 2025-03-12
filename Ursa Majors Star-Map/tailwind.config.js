/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "electric-blue": "#4a7bff", // Updated to lighter blue
        "crimson-red": "#dc143c",
        "canary-yellow": "#ffef00",
        "space-black": "#0a0e17",
        "dark-space": "#13151a",
      },
      boxShadow: {
        'sun': '0 0 30px rgba(255, 200, 0, 0.6)',
        'blue-sun': '0 0 30px rgba(100, 200, 255, 0.6)',
      }
    },
  },
  plugins: [],
}
