/** Identidad visual · Opción 05 Titanio y Azul Hielo. No usar colores fuera de estos tokens. */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // En hex (no var()) para que funcionen los modificadores de opacidad como bg-titanio/60.
    // Mismos valores que las variables --c-* de src/index.css.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      titanio: '#2B3440',
      hielo: {
        DEFAULT: '#0EA5E9',
        hover: '#0284C7',
        texto: '#0369A1',
      },
      'cta-ink': '#0B2233',
      texto: '#161C24',
      gris: '#687483',
      fondo: '#F1F4F7',
      blanco: '#FFFFFF',
      whatsapp: '#25D366',
      ok: '#1E7A45',
      agotado: '#C62828',
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
