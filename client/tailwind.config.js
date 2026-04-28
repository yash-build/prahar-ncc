/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#2e3b2c',
          dark:    '#1f2a1d',
          deep:    '#141a13',
          light:   '#4a5a48',
          muted:   '#6b7a69',
          faint:   '#a8b8a5',
          ghost:   '#d4ddd2',
        },
        khaki: {
          DEFAULT: '#c2b280',
          dark:    '#a89060',
          light:   '#d8ccaa',
        },
        gold: {
          DEFAULT: '#d4af37',
          dark:    '#b8962c',
          light:   '#e8cc6a',
        },
        parchment: '#e8efe6',
        surface: {
          DEFAULT: '#1f2a1d',
          2:       '#253322',
          3:       '#2c3b29',
          4:       '#344534',
        },
        smoke: '#f0ede6',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
        sans:    ['"IBM Plex Sans"', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 2px 8px rgba(0,0,0,0.1)',
        'card-lg':  '0 8px 24px rgba(0,0,0,0.15)',
        'glow-gold':'0 0 20px rgba(212,175,55,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'wiggle':     'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-10deg)' },
          '50%': { transform: 'rotate(10deg)' },
        }
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
      },
    },
  },
  plugins: [],
};
