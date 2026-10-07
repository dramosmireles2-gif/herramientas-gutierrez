import { useAdmin } from '../store/AdminStore'
import { IconoMenu } from '../components/iconos'
import { PinIcon } from '../../components/icons'

const etiquetaUsuario = (u, sucursales) =>
  u.rol === 'admin' ? 'Administrador' : `Encargado — ${sucursales.find((s) => s.id === u.sucursal_id)?.nombre ?? ''}`

/**
 * Selector de rol (para enseñar la diferencia en la demo) y de sucursal.
 * El encargado tiene la sucursal fija: solo ve la suya.
 */
export default function BarraSuperior({ onAbrirMenu }) {
  const { datos, usuario, esAdmin, sucursalFiltro, cambiarUsuario, cambiarSucursalFiltro } = useAdmin()
  const sucursales = datos.sucursales.filter((s) => s.activa)

  return (
    <header className="border-b border-titanio/10 bg-blanco">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 lg:px-8">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-titanio hover:bg-fondo lg:hidden"
          aria-label="Abrir menú"
        >
          <IconoMenu />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm">
          <span className="text-gris">Hola, </span>
          <strong className="text-titanio">{usuario.nombre}</strong>
        </p>

        <div className="flex w-full gap-2 sm:w-auto">
          <label className="min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">Ver como</span>
            <select
              value={usuario.id}
              onChange={(e) => cambiarUsuario(e.target.value)}
              className="h-10 w-full rounded-lg border border-gris/40 bg-blanco pl-3 pr-8 text-sm font-semibold text-titanio"
              title="Cambia de rol para ver qué puede hacer cada usuario"
            >
              {datos.usuarios.map((u) => (
                <option key={u.id} value={u.id}>{etiquetaUsuario(u, datos.sucursales)}</option>
              ))}
            </select>
          </label>

          <label className="relative min-w-0 flex-1 sm:flex-none">
            <span className="sr-only">Sucursal</span>
            <PinIcon width={16} height={16} className="pointer-events-none absolute left-2.5 top-3 text-hielo-texto" />
            <select
              value={sucursalFiltro}
              onChange={(e) => cambiarSucursalFiltro(e.target.value)}
              disabled={!esAdmin}
              className="h-10 w-full rounded-lg border border-gris/40 bg-blanco pl-8 pr-8 text-sm font-semibold text-titanio disabled:bg-fondo disabled:opacity-100"
              title={esAdmin ? 'Filtra todo el panel por sucursal' : 'Como encargado solo ves tu sucursal'}
            >
              {esAdmin && <option value="todas">Todas las sucursales</option>}
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </label>
        </div>
      </div>
    </header>
  )
}
