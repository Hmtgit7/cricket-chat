/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6ee7b7',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        secondary: {
          light: '#bae6fd',
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
        },
        chat: {
          sent: '#dcf8c6',
          received: '#ffffff',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}