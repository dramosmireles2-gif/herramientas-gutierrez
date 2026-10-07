import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Drawer from '../../components/Drawer'
import Logo from '../../components/Logo'
import BandaDemo from './BandaDemo'
import BarraLateral from './BarraLateral'
import BarraSuperior from './BarraSuperior'

// Logo de la tienda (reutilizado tal cual; lleva a la tienda) + etiqueta del panel.
function Marca() {
  return (
    <div className="px-4 pb-2 pt-4">
      <Logo />
      <p className="mt-2 inline-block rounded bg-hielo px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-cta-ink">
        Panel administrativo
      </p>
    </div>
  )
}

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="min-h-screen bg-fondo text-texto">
      <BandaDemo />
      <div className="flex">
        {/* Barra lateral fija en escritorio */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-titanio lg:flex">
          <Marca />
          <BarraLateral />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <BarraSuperior onAbrirMenu={() => setMenuAbierto(true)} />
          <main id="contenido" className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* En móvil el menú se abre en un panel lateral (mismo Drawer de la tienda) */}
      <Drawer open={menuAbierto} onClose={cerrarMenu} title="Menú">
        <div className="-mx-4 -my-4 h-[calc(100%+2rem)] bg-titanio">
          <BarraLateral onNavegar={cerrarMenu} />
        </div>
      </Drawer>
    </div>
  )
}
