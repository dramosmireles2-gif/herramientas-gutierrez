import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import NotFound from './pages/NotFound'

// Inicio, catálogo y producto van en el paquete principal (son las páginas de entrada desde anuncios).
// Carrito también: pesa poco y, cargado aparte, su versión vacía (corta) hacía saltar el footer (CLS).
// El resto se carga al visitarlas para que la primera carga pese menos.
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Branches = lazy(() => import('./pages/Branches'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="producto/:slug" element={<Product />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="pedido/:folio" element={<OrderConfirmation />} />
        <Route path="sucursales" element={<Branches />} />
        <Route path="nosotros" element={<About />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
