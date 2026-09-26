/** Identidad visual · Opción 05 Titanio y Azul Hielo. No usar colores fuera de estos tokens. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      titanio: 'var(--c-titanio)',
      hielo: {
        DEFAULT: 'var(--c-hielo)',
        hover: 'var(--c-hielo-hover)',
        texto: 'var(--c-hielo-texto)',
      },
      'cta-ink': 'var(--c-cta-ink)',
      texto: 'var(--c-texto)',
      gris: 'var(--c-gris)',
      fondo: 'var(--c-fondo)',
      blanco: 'var(--c-blanco)',
      whatsapp: 'var(--c-whatsapp)',
      ok: 'var(--c-ok)',
      agotado: 'var(--c-agotado)',
    },
    fontFamily: {
      display: ['Archivo', 'system-ui', 'sans-serif'],
      sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
    },
    extend: {
      maxWidth: { page: '80rem' },
    },
  },
  plugins: [],
}
