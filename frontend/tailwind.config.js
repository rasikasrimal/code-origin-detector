/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      boxShadow: {
        glow: '0 25px 70px rgba(79, 70, 229, 0.25)',
        card: '0 22px 45px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'aurora': 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(147,197,253,0.2), transparent 60%)',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
