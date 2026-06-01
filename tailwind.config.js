/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--c-primary)',
          dark: 'var(--c-primary-dark)',
          txt: 'var(--c-primary-txt)',
        },
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        main: 'var(--c-text-main)',
        sub: 'var(--c-text-sub)',
        line: 'var(--c-border)',
        error: { DEFAULT: 'var(--c-error)', bg: 'var(--c-error-bg)' },
        warning: { DEFAULT: 'var(--c-warning)', bg: 'var(--c-warning-bg)' },
        success: { DEFAULT: 'var(--c-success)', bg: 'var(--c-success-bg)' },
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Noto Sans TC', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(50,65,76,0.04), 0 4px 16px rgba(50,65,76,0.06)',
        card: '0 1px 3px rgba(50,65,76,0.05), 0 8px 24px rgba(50,65,76,0.05)',
      },
    },
  },
  plugins: [],
}
