/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#b8ddff',
          300: '#88c6ff',
          400: '#56a7ff',
          500: '#2b86ff',
          600: '#1a68e6',
          700: '#1653b4',
          800: '#153f85',
          900: '#13366c'
        },
        accent: '#12c2e9',
      },
      boxShadow: {
        card: '0 6px 24px -6px rgb(0 0 0 / 0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2b86ff 0%, #12c2e9 50%, #7f53ac 100%)',
      },
      animation: {
        pulse: "pulse 2s infinite",
        bubble: "bubble 3s infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        bubble: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(1.1)", opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};



