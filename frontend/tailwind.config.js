/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: { 50: '#fef7ee', 100: '#fdedd6', 200: '#f9d7ad', 300: '#f4ba78', 400: '#ee9242', 500: '#ea761e', 600: '#db5c14', 700: '#b54412', 800: '#903617', 900: '#742f16', 950: '#3f150a' },
        accent: { 50: '#f0fdf9', 100: '#ccfbef', 200: '#99f6df', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
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
