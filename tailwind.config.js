/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        forest: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        earth: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
      },
      backgroundImage: {
        'nature-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'forest-gradient': 'linear-gradient(135deg, #84cc16 0%, #16a34a 100%)',
        'earth-gradient': 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      },
      boxShadow: {
        'nature': '0 10px 40px rgba(34, 197, 94, 0.2)',
        'nature-lg': '0 20px 60px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
}
