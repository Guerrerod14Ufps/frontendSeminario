/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f46e5',
          600: '#4338ca',
          700: '#3730a3',
          800: '#312e81',
          900: '#1e1b4b',
          DEFAULT: '#4f46e5',
          foreground: '#f8fafc',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
          foreground: '#0f172a',
        },
        success: '#22c55e',
        warning: '#facc15',
        danger: '#ef4444',
        surface: {
          DEFAULT: '#ffffff',
          subtle: '#f8fafc',
          muted: '#e2e8f0',
          inverted: '#0f172a',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(79, 70, 229, 0.35)',
        focus: '0 0 0 3px rgba(79, 70, 229, 0.25)',
      },
      borderRadius: {
        xl: '1.25rem',
      },
      keyframes: {
        pulseScore: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
      animation: {
        pulseScore: 'pulseScore 3s ease-in-out infinite',
        wiggle: 'wiggle 0.4s ease-in-out',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

