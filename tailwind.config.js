/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aviation: {
          dark: '#0d1b2a',
          darker: '#050a12',
          primary: '#0a4d8f',
          'primary-light': '#1e6bb8',
          accent: '#ff6b35',
          'accent-glow': 'rgba(255, 107, 53, 0.3)',
          light: '#e0e1dd',
          'text-dim': '#a8b2d1',
          success: '#4ade80',
          warning: '#fbbf24',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        body: ['IBM Plex Sans', 'sans-serif'],
      },
      animation: {
        'grid-move': 'gridMove 20s linear infinite',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'fly-across': 'flyAcross 15s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' }
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        flyAcross: {
          '0%': { left: '-10%', top: '20%' },
          '50%': { top: '60%' },
          '100%': { left: '110%', top: '20%' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 53, 0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(30, 107, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 107, 184, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      }
    },
  },
  plugins: [],
}