/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:      '#080c14',
          surface: '#0d1220',
          card:    '#111827',
          border:  '#1e3a5f',
          blue:    '#0ea5e9',
          glow:    '#38bdf8',
          accent:  '#06b6d4',
          red:     '#ef4444',
          green:   '#22c55e',
          yellow:  '#eab308',
          muted:   '#64748b',
          text:    '#cbd5e1',
          bright:  '#f1f5f9',
        },
      },
      fontFamily: {
        mono:  ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans:  ['"Sora"', 'sans-serif'],
        display: ['"Orbitron"', 'monospace'],
      },
      boxShadow: {
        'neon':       '0 0 20px rgba(14,165,233,0.3)',
        'neon-lg':    '0 0 40px rgba(14,165,233,0.4)',
        'neon-red':   '0 0 20px rgba(239,68,68,0.3)',
        'neon-green': '0 0 20px rgba(34,197,94,0.3)',
        'glass':      '0 8px 32px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'scan':        'scan 2s linear infinite',
        'flicker':     'flicker 4s linear infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        scan: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%':            { opacity: '0.6' },
          '97%':            { opacity: '1' },
          '98%':            { opacity: '0.4' },
          '99%':            { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
