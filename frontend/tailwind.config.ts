import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        /* ── Primary — Luxury Crimson/Ruby ── */
        primary: {
          DEFAULT: '#C41E3A',
          50:  '#FFF0F3',
          100: '#FFCDD6',
          200: '#FFA8B8',
          300: '#FF7A96',
          400: '#E8506A',
          500: '#C41E3A',
          600: '#A3162D',
          700: '#8B0020',
          800: '#6B0019',
          900: '#4A0011',
          foreground: '#FFFFFF',
        },

        /* ── gold: backward-compat alias → maps to crimson ── */
        gold: {
          DEFAULT: '#C41E3A',
          light: '#E8506A',
          50:  '#FFF0F3',
          100: '#FFCDD6',
          200: '#FFA8B8',
          300: '#FF7A96',
          400: '#E8506A',
          500: '#C41E3A',
          600: '#A3162D',
          700: '#8B0020',
          800: '#6B0019',
          900: '#4A0011',
        },

        /* ── Dark backgrounds (Zinc) ── */
        black: {
          DEFAULT: '#09090B',
          50:  '#1a1a1d',
          100: '#141417',
          200: '#111113',
          300: '#0E0E10',
          400: '#09090B',
          500: '#070709',
          600: '#050506',
          700: '#030304',
          800: '#020202',
          900: '#000000',
        },
        charcoal: '#18181B',
        surface:  '#27272A',

        /* ── Off-white ── */
        background: '#FAF9F7',

        /* ── Semantic borders ── */
        border:           'rgba(255,255,255,0.08)',
        'border-strong':  'rgba(255,255,255,0.15)',
        'border-primary': 'rgba(196,30,58,0.3)',
        'border-gold':    'rgba(196,30,58,0.3)',   // backward compat

        /* ── Text ── */
        foreground: '#FFFFFF',

        /* ── State ── */
        success: {
          DEFAULT: '#15803D',
          light:   '#22C55E',
          dark:    '#14532D',
        },
        warning: {
          DEFAULT: '#B45309',
          light:   '#F59E0B',
          dark:    '#78350F',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#EF4444',
          dark:    '#991B1B',
        },

        /* ── Shadcn compatibility ── */
        card: {
          DEFAULT:    '#27272A',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT:    '#27272A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT:    '#18181B',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT:    '#A1A1AA',
          foreground: '#71717A',
          bg:         '#27272A',
        },
        accent: {
          DEFAULT:    '#C41E3A',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT:    '#DC2626',
          foreground: '#FFFFFF',
        },
        input: 'rgba(255,255,255,0.08)',
        ring:  '#C41E3A',
      },

      fontFamily: {
        vazir: ['Vazirmatn', 'system-ui', 'sans-serif'],
        sans:  ['Vazirmatn', 'system-ui', 'sans-serif'],
        mono:  ['Courier New', 'monospace'],
      },

      fontSize: {
        '2xs':   ['0.625rem', { lineHeight: '1rem' }],
        xs:      ['0.75rem',  { lineHeight: '1.125rem' }],
        sm:      ['0.875rem', { lineHeight: '1.375rem' }],
        base:    ['1rem',     { lineHeight: '1.75rem' }],
        lg:      ['1.125rem', { lineHeight: '1.875rem' }],
        xl:      ['1.25rem',  { lineHeight: '2rem' }],
        '2xl':   ['1.5rem',   { lineHeight: '2.25rem' }],
        '3xl':   ['1.875rem', { lineHeight: '2.625rem' }],
        '4xl':   ['2.25rem',  { lineHeight: '3rem' }],
        '5xl':   ['3rem',     { lineHeight: '3.75rem' }],
        '6xl':   ['3.75rem',  { lineHeight: '4.5rem' }],
        '7xl':   ['4.5rem',   { lineHeight: '5.25rem' }],
        '8xl':   ['6rem',     { lineHeight: '7rem' }],
        '9xl':   ['8rem',     { lineHeight: '9rem' }],
        display: ['clamp(3rem,8vw,7rem)',   { lineHeight: '1.08' }],
        hero:    ['clamp(2.5rem,7vw,6rem)', { lineHeight: '1.1'  }],
      },

      letterSpacing: {
        tightest: '-0.075em',
        tighter:  '-0.05em',
        tight:    '-0.025em',
        normal:   '0',
        wide:     '0.025em',
        wider:    '0.05em',
        widest:   '0.1em',
        luxury:   '0.15em',
        brand:    '0.2em',
      },

      spacing: {
        18: '4.5rem',  22: '5.5rem',  30: '7.5rem',  34: '8.5rem',
        38: '9.5rem',  42: '10.5rem', 46: '11.5rem', 50: '12.5rem',
        54: '13.5rem', 58: '14.5rem', 62: '15.5rem', 66: '16.5rem',
        70: '17.5rem', 74: '18.5rem', 78: '19.5rem', 82: '20.5rem',
        86: '21.5rem', 90: '22.5rem', 94: '23.5rem', 98: '24.5rem',
      },

      borderRadius: {
        lg:   '0.75rem',
        md:   '0.5rem',
        sm:   '0.375rem',
        xl:   '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      boxShadow: {
        /* Primary — Luxury Red */
        'primary-sm': '0 2px 8px rgba(196,30,58,0.15)',
        'primary':    '0 4px 20px rgba(196,30,58,0.25)',
        'primary-lg': '0 8px 40px rgba(196,30,58,0.35)',
        'primary-xl': '0 16px 60px rgba(196,30,58,0.4)',
        /* gold → backward-compat alias */
        'gold-sm':    '0 2px 8px rgba(196,30,58,0.15)',
        'gold':       '0 4px 20px rgba(196,30,58,0.25)',
        'gold-lg':    '0 8px 40px rgba(196,30,58,0.35)',
        'gold-xl':    '0 16px 60px rgba(196,30,58,0.4)',
        /* General */
        luxury:       '0 25px 80px rgba(0,0,0,0.8)',
        'luxury-sm':  '0 10px 40px rgba(0,0,0,0.6)',
        card:         '0 1px 3px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(196,30,58,0.1)',
        inner:        'inset 0 2px 8px rgba(0,0,0,0.4)',
      },

      backgroundImage: {
        /* Primary gradients */
        'primary-gradient':    'linear-gradient(135deg, #C41E3A 0%, #E8506A 50%, #C41E3A 100%)',
        'primary-gradient-v':  'linear-gradient(180deg, #C41E3A 0%, #8B0020 100%)',
        'primary-glow':        'radial-gradient(ellipse at center, rgba(196,30,58,0.15) 0%, transparent 70%)',
        /* backward-compat aliases */
        'gold-gradient':       'linear-gradient(135deg, #C41E3A 0%, #E8506A 50%, #C41E3A 100%)',
        'gold-gradient-v':     'linear-gradient(180deg, #C41E3A 0%, #8B0020 100%)',
        'gold-glow':           'radial-gradient(ellipse at center, rgba(196,30,58,0.15) 0%, transparent 70%)',
        /* Dark */
        'dark-gradient':       'linear-gradient(135deg, #09090B 0%, #27272A 100%)',
        'surface-gradient':    'linear-gradient(135deg, #27272A 0%, #18181B 100%)',
        'hero-gradient':       'linear-gradient(135deg, #09090B 0%, #0F0F10 50%, #27272A 100%)',
        'card-gradient':       'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },

      animation: {
        'fade-in':        'fadeIn 0.6s ease-out forwards',
        'fade-up':        'fadeUp 0.7s ease-out forwards',
        'fade-down':      'fadeDown 0.7s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left':  'slideInLeft 0.5s ease-out forwards',
        'scale-in':       'scaleIn 0.4s ease-out forwards',
        'primary-pulse':  'primaryPulse 3s ease-in-out infinite',
        'gold-pulse':     'primaryPulse 3s ease-in-out infinite',  // backward compat
        shimmer:          'shimmer 2s linear infinite',
        float:            'float 6s ease-in-out infinite',
        'spin-slow':      'spin 8s linear infinite',
      },

      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:    { '0%': { opacity: '0', transform: 'translateY(24px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeDown:  { '0%': { opacity: '0', transform: 'translateY(-24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(32px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
        slideInLeft:  { '0%': { opacity: '0', transform: 'translateX(-32px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        primaryPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196,30,58,0)' },
          '50%':       { boxShadow: '0 0 30px 8px rgba(196,30,58,0.2)' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:   { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-12px)' } },
      },

      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        250: '250ms', 350: '350ms', 400: '400ms',  600: '600ms',
        800: '800ms', 1000: '1000ms', 1200: '1200ms',
      },

      screens: {
        xs:    '375px',
        sm:    '640px',
        md:    '768px',
        lg:    '1024px',
        xl:    '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },

      zIndex: { 60: '60', 70: '70', 80: '80', 90: '90', 100: '100' },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
