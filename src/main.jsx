import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { BranchProvider } from './context/BranchContext'
import { CartProvider } from './context/CartContext'
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
