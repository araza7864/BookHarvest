/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#e8f2f2',
          100: '#cce5e6',
          200: '#99cbcc',
          300: '#66b1b3',
          400: '#4C7D7F',
          500: '#3d6466',
          600: '#2e4b4d',
          700: '#1f3233',
          800: '#0f191a',
          900: '#0a1112',
          950: '#050809',
        },
        accent: {
          50: '#f9eceb',
          100: '#f2d9d6',
          200: '#e5b3ad',
          300: '#d88d85',
          400: '#8C4037',
          500: '#70332c',
          600: '#542621',
          700: '#381a16',
          800: '#1c0d0b',
          900: '#0f0706',
          950: '#080403',
        },
        harvest: {
          /* Logo book spines & brand (match bookharvest-logo.png) */
          'dark-teal': '#4C7D7F',
          'dark-red': '#903617', /* rgb(144, 54, 23) */
          green: '#6b8f6c',
          ochre: '#D1B168',
          'burnt-orange': '#C77A4B',
          /* Hero/background from logo */
          'bg-warm': '#95483E',
          'bg-cool': '#4C7D7F',
          'bg-page': '#95483E',
          border: '#ADD8E6',
          text: '#000000',
        },
      },
      animation: {
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'bounce-soft': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
}
