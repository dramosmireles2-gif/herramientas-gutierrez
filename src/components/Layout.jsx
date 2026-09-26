import { Outlet, useMatch } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppFloat from './WhatsAppFloat'
import ScrollToTop from './ScrollToTop'
import { useContactBranch } from '../hooks/useContactBranch'
import { buildGeneralUrl } from '../services/whatsapp'

export default function Layout() {
  const branch = useContactBranch()
  // En la ficha de producto hay barra CTA fija abajo en móvil: el botón flotante se sube.
  const onProduct = useMatch('/producto/:slug')

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blanco focus:px-4 focus:py-2"
      >
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat href={buildGeneralUrl(branch)} raised={Boolean(onProduct)} />
    </div>
  )
}
