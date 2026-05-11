/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary) / 0.9)',
          fixed: 'hsl(var(--primary) / 0.14)',
          'fixed-foreground': 'hsl(var(--primary))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          container: 'hsl(var(--secondary) / 0.14)',
          'container-foreground': 'hsl(var(--secondary))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          container: 'hsl(var(--destructive) / 0.12)',
          'container-foreground': 'hsl(var(--destructive))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* Compatibility aliases used by existing components */
        surface: 'hsl(var(--background))',
        'surface-container-lowest': 'hsl(var(--card))',
        'surface-container-low': 'hsl(var(--muted))',
        'surface-container': 'hsl(var(--popover))',
        'surface-container-high': 'hsl(var(--border) / 0.7)',
        'on-surface': 'hsl(var(--foreground))',
        'on-surface-variant': 'hsl(var(--muted-foreground))',
        'inverse-surface': 'hsl(var(--foreground))',
        'outline-variant': 'hsl(var(--border))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        DEFAULT: 'var(--radius)',
        xl: 'calc(var(--radius) + 0.5rem)',
      },
      fontFamily: {
        sans: ['Manrope', 'Cairo', 'sans-serif'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        h1: ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        h2: ['36px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        h3: ['30px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        h4: ['24px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['18px', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-base': ['16px', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'label-md': ['14px', { lineHeight: '1', letterSpacing: '0.02em' }],
        'label-xs': ['12px', { lineHeight: '1', letterSpacing: '0.04em' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        'container-padding': '24px',
        'grid-gutter': '16px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        soft: 'var(--shadow-lg)',
        elevated: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
}
