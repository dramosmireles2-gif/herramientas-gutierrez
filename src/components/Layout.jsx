import { Suspense } from 'react'
import { Outlet, useMatch } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import ScrollToTop from './ScrollToTop'
import BranchPicker from './BranchPicker'
import CartDrawer from './CartDrawer'
import { useBranch } from '../context/BranchContext'
import { useCart } from '../context/CartContext'
import { buildGeneralUrl } from '../services/whatsapp'

export default function Layout() {
  const { branch, openPicker } = useBranch()
  const { count } = useCart()
  // En la ficha de producto hay barra CTA fija abajo en móvil: el botón flotante se sube.
  const onProduct = useMatch('/producto/:slug')
  // En checkout y confirmación ya hay botón de WhatsApp y el flotante tapaba el total.
  const onCheckout = useMatch('/checkout')
  const onOrder = useMatch('/pedido/:folio')

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blanco focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Header branchName={branch?.city ?? null} cartCount={count} onBranchClick={openPicker} />
      <main id="contenido" className="flex-1">
        {/* min-h-screen: mientras carga la página, el footer queda fuera de vista y no "salta" (CLS). */}
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!onCheckout && !onOrder && (
        <WhatsAppFloat href={buildGeneralUrl(branch)} onNeedBranch={openPicker} raised={Boolean(onProduct)} />
      )}
      <CartDrawer />
      <BranchPicker />
    </div>
  )
}
