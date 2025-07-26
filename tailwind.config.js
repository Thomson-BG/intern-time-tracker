/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'csea': {
          'yellow': '#FFED4E', // Canary yellow
          'navy': '#1E3A8A', // Dark navy blue
          'dark-blue': '#1E40AF', // Slightly lighter navy for variation
          'light-gray': '#F8FAFC',
          'medium-gray': '#64748B',
        }
      },
    },
  },
  plugins: [],
}
