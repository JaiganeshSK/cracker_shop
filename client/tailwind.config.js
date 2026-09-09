/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          base: '#080c14',
          card: '#0d1420',
          elevated: '#111827',
          overlay: '#161f30',
          border: 'rgba(255,255,255,0.07)',
        },
        gold: {
          50:  '#fdf8e7',
          100: '#faefc0',
          200: '#f5dc80',
          300: '#eec847',
          400: '#d4a017',
          500: '#b8860b',
          600: '#9a6f09',
          700: '#7c5907',
          800: '#5e4205',
          900: '#3f2c03',
        },
        brand: {
          dark:   '#080c14',
          card:   '#0d1420',
          border: '#1a2336',
          gold:   '#d4a017',
          'gold-light': '#e8b830',
          crimson: '#dc2626',
          amber:  '#b8860b',
          emerald: '#10b981',
        },
      },
      animation: {
        'sparkle':       'sparkle 2.5s ease-in-out infinite',
        'pulse-glow':    'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow':    'float 4s ease-in-out infinite',
        'shimmer':       'shimmer 1.6s ease-in-out infinite',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':       'fadeIn 0.25s ease-out both',
        'fade-slide-up': 'fadeSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'marquee':       'marquee 28s linear infinite',
        'bounce-subtle': 'bounceSub 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'drawer-in':     'drawerIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.85)' },
          '50%':      { opacity: '1',   transform: 'scale(1.15)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 8px rgba(212,160,23,0.3))' },
          '50%':      { opacity: '1',   filter: 'drop-shadow(0 0 18px rgba(212,160,23,0.6))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        bounceSub: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.16)' },
          '100%': { transform: 'scale(1)' },
        },
        drawerIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
