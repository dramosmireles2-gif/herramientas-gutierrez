import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useBranch } from '../context/BranchContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice } from '../lib/format'
import CartLine from '../components/CartLine'
import { CartIcon, PinIcon } from '../components/icons'

export default function Cart() {
  usePageMeta('Carrito')
  const { lines, count, subtotal, clear } = useCart()
  const { branch, openPicker } = useBranch()

  if (lines.length === 0) {
    return (
      <section className="container-page py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blanco text-gris shadow-sm">
          <CartIcon width={36} height={36} />
        </span>
        <h1 className="mt-5 text-4xl uppercase text-titanio">Tu carrito está vacío</h1>
        <p className="mt-2 text-gris">Agrega generadores, hidrolavadoras o lo que necesites para tu obra.</p>
        <Link to="/catalogo" className="btn-primary mt-6">Ver catálogo</Link>
      </section>
    )
  }

  return (
    <div className="container-page py-6 md:py-10">
      <nav aria-label="Ruta" className="mb-2 text-sm text-gris">
        <Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span> Carrito
      </nav>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-4xl uppercase text-titanio md:text-5xl">Tu carrito</h1>
        <button type="button" onClick={clear} className="pb-1 text-sm font-semibold text-gris hover:text-agotado hover:underline">
          Vaciar carrito
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section aria-label="Productos" className="rounded-xl bg-blanco px-4 shadow-sm ring-1 ring-titanio/5 sm:px-6">
          <ul className="divide-y divide-fondo">
            {lines.map((l) => <CartLine key={l.product.id} line={l} />)}
          </ul>
        </section>

        <aside aria-label="Resumen" className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 lg:sticky lg:top-24">
          <h2 className="text-2xl uppercase text-titanio">Resumen</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Productos ({count})</dt>
              <dd className="price text-base">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-gris">
              <dt>Envío</dt>
              <dd>Se calcula en el siguiente paso</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-fondo pt-4">
            <span className="font-bold">Subtotal</span>
            <span className="price text-3xl text-titanio">{formatPrice(subtotal)}</span>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-fondo p-3 text-sm">
            <PinIcon width={18} height={18} className="mt-0.5 shrink-0 text-hielo-texto" />
            <p className="flex-1">
              {branch ? <>Recoge en <strong>{branch.city}</strong></> : 'Aún no eliges sucursal'}
              {' · '}
              <button type="button" onClick={openPicker} className="font-semibold text-hielo-texto hover:underline">
                {branch ? 'Cambiar' : 'Elegir'}
              </button>
            </p>
          </div>

          <Link to="/checkout" className="btn-primary mt-4 w-full text-lg">Ir a pagar</Link>
          <Link to="/catalogo" className="mt-3 block text-center text-sm font-semibold text-hielo-texto hover:underline">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </div>
  )
}
