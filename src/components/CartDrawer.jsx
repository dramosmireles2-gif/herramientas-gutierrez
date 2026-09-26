import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import Drawer from './Drawer'
import CartLine from './CartLine'
import { CartIcon } from './icons'

export default function CartDrawer() {
  const { lines, count, subtotal, drawerOpen, closeDrawer } = useCart()
  const navigate = useNavigate()
  const go = (to) => {
    closeDrawer()
    navigate(to)
  }

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      side="right"
      title={`Tu carrito${count ? ` (${count})` : ''}`}
      footer={lines.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Subtotal</span>
            <span className="price text-2xl text-titanio">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-gris">Recoger en sucursal o envío se elige en el siguiente paso.</p>
          <button type="button" onClick={() => go('/checkout')} className="btn-primary mt-3 w-full text-lg">Ir a pagar</button>
          <button type="button" onClick={() => go('/carrito')} className="btn mt-2 w-full border border-titanio/20 text-titanio hover:bg-fondo">
            Ver carrito
          </button>
        </div>
      )}
    >
      {lines.length === 0 ? (
        <div className="py-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fondo text-gris">
            <CartIcon width={30} height={30} />
          </span>
          <p className="mt-4 font-semibold text-titanio">Tu carrito está vacío</p>
          <Link to="/catalogo" onClick={closeDrawer} className="btn-primary mt-4">Ver catálogo</Link>
        </div>
      ) : (
        <ul className="-my-4 divide-y divide-fondo">
          {lines.map((l) => <CartLine key={l.product.id} line={l} onNavigate={closeDrawer} compact />)}
        </ul>
      )}
    </Drawer>
  )
}
