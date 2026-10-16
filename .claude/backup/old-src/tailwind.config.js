/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-be-vietnam)', 'Be Vietnam Pro', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        ink: '#12231E',
        deep: '#042F24',
        tech: '#0F6B4B',
        medium: '#49645A',
        mint: '#EEF5EE',
        pale: '#F8F8F1',
        lime: '#A8D833',
        line: '#D9E4DA',
      },
      boxShadow: {
        instrument: '0 32px 86px rgba(18, 35, 30, 0.11)',
        soft: '0 18px 50px rgba(6, 48, 37, 0.10)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
