/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#18211F',
        deep: '#12312B',
        tech: '#0F6B4B',
        medium: '#2D5A45',
        mint: '#EEF6F1',
        pale: '#F7FAF7',
        lime: '#B7E36D',
        coral: '#EF7D5B',
        line: '#DCE7E1',
      },
      boxShadow: {
        glass: '0 24px 70px rgba(18, 49, 43, 0.14)',
        soft: '0 18px 50px rgba(18, 49, 43, 0.10)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
