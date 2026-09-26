import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Branches from './pages/Branches'
import About from './pages/About'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

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
