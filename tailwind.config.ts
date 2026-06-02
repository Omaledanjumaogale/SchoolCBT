import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cobalt: {
          DEFAULT: '#002366',
          50: '#eef1fb',
          100: '#c5d0ef',
          light: '#003399',
          dark: '#001540',
          xdark: '#000d2e',
        },
        jade: {
          DEFAULT: '#50C878',
          light: '#6FD991',
          dark: '#3CAF62',
        },
        gold: {
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          dark: '#CCA900',
        },
        scarlet: {
          DEFAULT: '#DC3545',
          light: '#E85563',
          dark: '#B02837',
        },
        // Nigerian green for accent
        ng: {
          green: '#008751',
          light: '#00A865',
          white: '#F8F9FA',
        },
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'fade-up': 'fadeUp 0.65s ease forwards',
        shimmer: 'shimmer 4.5s linear infinite',
        'orb-drift': 'orbDrift 12s ease-in-out infinite alternate',
        'pulse-dot': 'pulseDot 1.8s ease-in-out infinite',
        'ticker-scroll': 'tickerScroll 28s linear infinite',
        'count-up': 'countUp 0.6s ease forwards',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% center' },
          to: { backgroundPosition: '200% center' },
        },
        orbDrift: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '100%': { transform: 'translate(24px, 36px) scale(1.07)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
        },
        tickerScroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
        'gold-glow': '0 0 30px rgba(255, 215, 0, 0.18)',
        'jade-glow': '0 0 20px rgba(80, 200, 120, 0.18)',
        card: '0 4px 24px rgba(0, 0, 0, 0.25)',
        'card-hover': '0 18px 44px rgba(0, 0, 0, 0.38)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(0,51,153,0.55) 0%, transparent 70%)',
        'mesh-radial':
          'radial-gradient(ellipse 70% 60% at 15% 50%, rgba(0,40,120,0.22) 0%, transparent 65%)',
        'grid-subtle':
          'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        'shimmer-gold': 'linear-gradient(90deg, #FFD700 0%, #fff 40%, #FFD700 80%)',
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config
