/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme base
        surface: {
          50: '#FFFBF9',
          100: '#FFF7F4',
          200: '#FFF0EB',
          300: '#FFE8E0',
          400: '#FFD9CC',
        },
        // Warm dark text
        ink: {
          900: '#2D1F1F',
          800: '#3D2A2A',
          700: '#5C3D3D',
          600: '#7A5555',
          500: '#997070',
          400: '#B89A9A',
          300: '#D4BFBF',
          200: '#E8D9D9',
          100: '#F5EFEF',
        },
        accent: {
          DEFAULT: '#e8788a',
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbd0d9',
          300: '#f7a8b8',
          400: '#f27d93',
          500: '#e8788a',
          600: '#d4506b',
          700: '#b23d58',
          800: '#95364d',
          900: '#7f3147',
        },
        warm: {
          rose: '#e8788a',
          blush: '#f7a8b8',
          peach: '#f5c5a3',
          gold: '#d4a24e',
          amber: '#c4854f',
          coral: '#e07868',
        },
        neon: {
          purple: '#a855f7',
          blue: '#3b82f6',
          cyan: '#0891b2',
          green: '#059669',
          pink: '#ec4899',
          rose: '#f43f5e',
        },
        // Badge / difficulty
        easy: '#059669',
        medium: '#d97706',
        hard: '#e11d48',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
        'ripple': 'ripple 0.6s linear',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 120, 138, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(232, 120, 138, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(45, 31, 31, 0.06), 0 4px 12px rgba(232, 120, 138, 0.04)',
        'card-hover': '0 4px 16px rgba(45, 31, 31, 0.08), 0 8px 24px rgba(232, 120, 138, 0.08)',
        'warm': '0 4px 20px rgba(232, 120, 138, 0.12)',
        'warm-lg': '0 8px 40px rgba(232, 120, 138, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
