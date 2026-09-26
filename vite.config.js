import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base debe coincidir con el nombre del repo en GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/herramientas-gutierrez/',
})
