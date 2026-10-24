import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          container: 'var(--color-primary-container)',
          fixed: 'var(--color-primary-fixed)',
          'fixed-dim': 'var(--color-primary-fixed-dim)',
        },
        'on-primary': {
          DEFAULT: 'var(--color-on-primary)',
          container: 'var(--color-on-primary-container)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          container: 'var(--color-secondary-container)',
          fixed: 'var(--color-secondary-fixed)',
        },
        'on-secondary': 'var(--color-on-secondary)',
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          container: 'var(--color-tertiary-container)',
          fixed: 'var(--color-tertiary-fixed)',
          'fixed-dim': 'var(--color-tertiary-fixed-dim)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          dim: 'var(--color-surface-dim)',
          bright: 'var(--color-surface-bright)',
          'container-lowest': 'var(--color-surface-container-lowest)',
          'container-low': 'var(--color-surface-container-low)',
          container: 'var(--color-surface-container)',
          'container-high': 'var(--color-surface-container-high)',
          'container-highest': 'var(--color-surface-container-highest)',
        },
        'on-surface': {
          DEFAULT: 'var(--color-on-surface)',
          variant: 'var(--color-on-surface-variant)',
        },
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outline-variant)',
        },
        success: 'var(--color-success)',
        error: {
          DEFAULT: 'var(--color-error)',
          container: 'var(--color-error-container)',
        },
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        headline: ['var(--font-newsreader)', 'Georgia', 'serif'],
        body: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        full: '9999px',
      },
      boxShadow: {
        xs: '0 1px 4px rgba(91, 42, 134, 0.03)',
        sm: '0 4px 16px -2px rgba(91, 42, 134, 0.04)',
        md: '0 8px 32px -4px rgba(91, 42, 134, 0.06), 0 2px 8px -2px rgba(91, 42, 134, 0.03)',
        lg: '0 16px 40px -8px rgba(91, 42, 134, 0.10), 0 4px 12px -2px rgba(91, 42, 134, 0.04)',
        xl: '0 24px 64px -12px rgba(45, 21, 66, 0.18)',
        glow: '0 0 24px rgba(91, 42, 134, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
