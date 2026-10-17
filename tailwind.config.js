/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Cùng chuỗi với HZ_QUERY (src/voyage/store.ts) và các @media trong voyage.css — đổi thì đổi cả ba.
      screens: { hz: { raw: '(min-width: 64rem) and (min-height: 37.5rem)' } },
      fontFamily: {
        sans: ['var(--font-be-vietnam)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
      },
      colors: {
        paper: '#f2eadb',
        ink: '#19211f',
        wash: '#7e8a82',
        cham: '#2d5e78',
        jade: '#3F8B76',
        son: '#B8322A',
        gold: '#C9A14A',
      },
      transitionTimingFunction: { expo: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
}
