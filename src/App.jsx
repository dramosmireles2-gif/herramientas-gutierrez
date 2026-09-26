import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import NotFound from './pages/NotFound'

// Rutas pendientes muestran un aviso hasta que se construyan en el paso 6.
const Pending = ({ title }) => <NotFound title={`${title}: próximamente`} />

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
        <Route path="sucursales" element={<Pending title="Sucursales" />} />
        <Route path="nosotros" element={<Pending title="Nosotros" />} />
        <Route path="contacto" element={<Pending title="Contacto" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
