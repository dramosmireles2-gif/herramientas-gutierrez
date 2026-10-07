import { Link } from 'react-router-dom'
import Logo from './Logo'
import CreditoRMKT from './CreditoRMKT'

const links = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/sucursales', label: 'Sucursales' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Footer() {
  return (
    <footer className="mt-16 bg-titanio text-blanco">
      <div className="container-page grid gap-8 py-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-blanco/80">
            Todo para la obra, el taller y el jardín. 5 sucursales en el noreste para que recojas tu pedido cerca de ti.
          </p>
        </div>
        <nav aria-label="Pie de página">
          <h2 className="text-lg uppercase">Tienda</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-blanco/80 hover:text-blanco hover:underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-lg uppercase">Sucursales</h2>
          <p className="mt-3 text-sm text-blanco/80">
            Cd. Victoria · Reynosa · Tampico · Saltillo · San Nicolás de los Garza
          </p>
        </div>
      </div>
      <div className="border-t border-blanco/10">
        {/* En móvil todo va a la izquierda: el botón flotante de WhatsApp ocupa la esquina derecha. */}
        <div className="container-page flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-blanco/70">
            © {new Date().getFullYear()} Herramientas Gutiérrez. Precios en pesos mexicanos (MXN).
          </p>
          <CreditoRMKT />
        </div>
      </div>
    </footer>
  )
}
