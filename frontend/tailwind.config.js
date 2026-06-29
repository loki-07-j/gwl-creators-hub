/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // GWL Creators Hub design tokens (from the approved prototype)
        ink: '#0B0F14',
        panel: '#0d131a',
        surface: '#1A2430',
        teal: { DEFAULT: '#2A96A6', light: '#36b6c9' },
        gold: { DEFAULT: '#F4C542', dark: '#D4A017' },
        muted: '#A8B3C2',
        faint: '#6b7686',
        soft: '#dfe5ee',
        success: '#00C853',
        danger: '#FF5252',
        'danger-soft': '#ff7b7b',
        violet: { DEFAULT: '#7c4dff', soft: '#7c8bff' },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
