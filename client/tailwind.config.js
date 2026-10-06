/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toyota: {
          red: '#D71920',
          dark: '#B01016',
          light: '#FDE8E9'
        },
        gemba: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          800: '#1E293B',
          900: '#0F172A'
        }
      }
    },
  },
  plugins: [],
}
