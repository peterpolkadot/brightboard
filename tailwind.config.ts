import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fef9ec',
          100: '#fef0c7',
          200: '#fede89',
          300: '#fec84b',
          400: '#fdb022',
          500: '#f79009',
          600: '#dc6803',
          700: '#b54708',
          800: '#93370d',
          900: '#7a2e0e',
        },
        coral:  { DEFAULT: '#FF6B6B', light: '#FF8E8E', dark: '#E05555' },
        sky:    { DEFAULT: '#4ECDC4', light: '#7EDDD7', dark: '#38B2AA' },
        lemon:  { DEFAULT: '#FFE66D', light: '#FFF0A0', dark: '#EDD500' },
        violet: { DEFAULT: '#A78BFA', light: '#C4B5FD', dark: '#7C3AED' },
        mint:   { DEFAULT: '#6EE7B7', light: '#A7F3D0', dark: '#34D399' },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        display: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'card': '0 4px 24px -4px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px -8px rgba(0,0,0,0.14)',
        'glow': '0 0 24px rgba(251,191,36,0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #FEF9EC 0%, #FEF3C7 30%, #E0F2FE 70%, #EDE9FE 100%)',
        'card-gradient': 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)',
        'brand-gradient': 'linear-gradient(135deg, #F79009 0%, #FF6B6B 100%)',
        'sky-gradient': 'linear-gradient(135deg, #4ECDC4 0%, #A78BFA 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
