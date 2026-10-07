import { useAdmin } from '../../store/AdminStore'
import PaginaEsqueleto from '../../components/PaginaEsqueleto'
import { formatoNumero } from '../../utils/formato'

export default function Dashboard() {
  const { datos } = useAdmin()
  const resumen = [
    ['Productos', datos.productos.length],
    ['Movimientos', datos.movimientos.length],
    ['Pedidos', datos.pedidos.length],
    ['Traspasos', datos.traspasos.length],
  ]

  return (
    <PaginaEsqueleto
      titulo="Dashboard"
      descripcion="Tu negocio de un vistazo: ventas, pedidos y lo que se está acabando."
      fase={3}
      contenido={[
        'Tarjetas: ventas del mes, pedidos por atender, existencia baja y valor del inventario',
        'Gráfica de ventas de los últimos 30 días',
        'Lista "Requiere atención": pedidos nuevos, agotados y traspasos por recibir',
      ]}
    >
      <ul className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Datos del demo cargados">
        {resumen.map(([etiqueta, valor]) => (
          <li key={etiqueta} className="rounded-xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5">
            <p className="text-xs font-bold uppercase tracking-wide text-gris">{etiqueta}</p>
            <p className="price text-3xl text-titanio">{formatoNumero(valor)}</p>
          </li>
        ))}
      </ul>
    </PaginaEsqueleto>
  )
}
