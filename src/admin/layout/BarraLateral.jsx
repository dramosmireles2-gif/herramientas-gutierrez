import { Link, NavLink } from 'react-router-dom'
import { useAdmin } from '../store/AdminStore'
import { navegacionPara } from './navegacion'
import { IconoSalir, IconoTienda } from '../components/iconos'

/** Menú del panel. En escritorio va fijo a la izquierda; en móvil se muestra dentro de un Drawer. */
export default function BarraLateral({ onNavegar }) {
  const { esAdmin, cerrarSesion } = useAdmin()

  return (
    <nav aria-label="Menú del panel" className="flex h-full flex-col">
      <ul className="admin-scroll flex-1 space-y-1 overflow-y-auto p-3">
        {navegacionPara(esAdmin).map(({ ruta, etiqueta, Icono }) => (
          <li key={ruta}>
            <NavLink
              to={ruta ? `/admin/${ruta}` : '/admin'}
              end={!ruta}
              onClick={onNavegar}
              className={({ isActive }) =>
                `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-hielo text-cta-ink' : 'text-blanco/80 hover:bg-blanco/10 hover:text-blanco'
                }`
              }
            >
              <Icono width={20} height={20} className="shrink-0" />
              {etiqueta}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-blanco/10 p-3">
        <Link to="/" onClick={onNavegar} className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-blanco/80 hover:bg-blanco/10 hover:text-blanco">
          <IconoTienda width={20} height={20} /> Ver la tienda
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavegar?.()
            cerrarSesion()
          }}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-blanco/80 hover:bg-blanco/10 hover:text-blanco"
        >
          <IconoSalir width={20} height={20} /> Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
