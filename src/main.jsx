import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { BranchProvider } from './context/BranchContext'
import { CartProvider } from './context/CartContext'
// Fuentes servidas desde el propio sitio (sin Google Fonts, que bloqueaba el render ~850 ms).
// Archivo con ejes de peso y ancho para la versión condensada (font-stretch 75%).
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource/public-sans/400.css'
import '@fontsource/public-sans/600.css'
import '@fontsource/public-sans/700.css'
import './index.css'

// HashRouter evita 404 al recargar en GitHub Pages. En producción se cambiará a URLs limpias.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <BranchProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </BranchProvider>
    </HashRouter>
  </StrictMode>,
)
