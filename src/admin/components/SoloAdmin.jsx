import { useAdmin } from '../store/AdminStore'
import Encabezado from './Encabezado'
import { IconoCandado } from './iconos'

/** Bloquea pantallas que el encargado de sucursal no puede usar (usuarios, configuración, Excel). */
export default function SoloAdmin({ titulo, children }) {
  const { esAdmin } = useAdmin()
  if (esAdmin) return children
  return (
    <>
      <Encabezado titulo={titulo} />
      <div className="rounded-xl bg-blanco p-8 text-center shadow-sm ring-1 ring-titanio/5">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fondo text-gris">
          <IconoCandado />
        </span>
        <p className="mt-4 font-bold text-titanio">Esta sección es solo para el administrador general.</p>
        <p className="mt-1 text-sm text-gris">Como encargado de sucursal puedes manejar el inventario y los pedidos de tu sucursal.</p>
      </div>
    </>
  )
}
