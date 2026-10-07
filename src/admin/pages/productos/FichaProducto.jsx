import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import Encabezado from '../../components/Encabezado'
import ImagenProducto from '../../components/ImagenProducto'
import Insignia from '../../components/Insignia'
import TablaMovimientos from '../../components/TablaMovimientos'
import { formatoMoneda } from '../../utils/formato'
import FormularioProducto from './FormularioProducto'
import ExistenciasProducto from './ExistenciasProducto'

const PESTANAS = [
  { id: 'existencias', etiqueta: 'Existencias' },
  { id: 'datos', etiqueta: 'Datos' },
  { id: 'historial', etiqueta: 'Historial' },
]

/** Ficha de producto: /admin/productos/nuevo (crear) o /admin/productos/:id (pestañas). */
export default function FichaProducto() {
  const { id } = useParams()
  const { datos, esAdmin, usuario } = useAdmin()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const nuevo = id === 'nuevo'
  const producto = datos.productos.find((p) => p.id === id)

  if (nuevo) {
    if (!esAdmin) {
      return <><Encabezado titulo="Nuevo producto" /><p className="text-gris">Solo el administrador puede crear productos.</p></>
    }
    return (
      <>
        <Volver />
        <Encabezado titulo="Nuevo producto" descripcion="Después de crearlo podrás registrar sus existencias por sucursal." />
        <FormularioProducto onGuardado={(p) => navigate(`/admin/productos/${p.id}?pestana=existencias`, { replace: true })} />
      </>
    )
  }

  if (!producto) {
    return (
      <>
        <Volver />
        <Encabezado titulo="Producto no encontrado" descripcion="Puede que se haya reiniciado el demo." />
      </>
    )
  }

  const pestana = PESTANAS.some((p) => p.id === params.get('pestana')) ? params.get('pestana') : 'existencias'
  const categoria = datos.categorias.find((c) => c.id === producto.categoria_id)?.nombre
  // El encargado solo ve el historial de su sucursal.
  const historial = datos.movimientos.filter((m) => m.producto_id === producto.id && (esAdmin || m.sucursal_id === usuario.sucursal_id))

  return (
    <>
      <Volver />
      <div className="mb-6 flex gap-4">
        <ImagenProducto producto={producto} className="w-20 shrink-0 sm:w-28" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gris">{producto.marca} · {categoria}</p>
          <Encabezado titulo={producto.nombre} />
          <div className="-mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono">{producto.sku}</span>
            <span className="price text-lg text-titanio">{formatoMoneda(producto.precio_oferta ?? producto.precio)}</span>
            {producto.tipo === 'sobre_pedido' && <Insignia tono="info">Sobre pedido</Insignia>}
            {!producto.activo && <Insignia>Inactivo</Insignia>}
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="Secciones del producto" className="mb-5 flex gap-1 overflow-x-auto border-b border-titanio/10">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={pestana === p.id}
            aria-controls={`panel-${p.id}`}
            onClick={() => setParams({ pestana: p.id }, { replace: true })}
            className={`-mb-px whitespace-nowrap border-b-[3px] px-4 py-3 text-sm font-bold ${pestana === p.id ? 'border-hielo text-titanio' : 'border-transparent text-gris hover:text-titanio'}`}
          >
            {p.etiqueta}{p.id === 'historial' && ` (${historial.length})`}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`}>
        {pestana === 'existencias' && <ExistenciasProducto producto={producto} />}
        {pestana === 'datos' && <FormularioProducto key={producto.actualizado_en} producto={producto} />}
        {pestana === 'historial' && <TablaMovimientos movimientos={historial} mostrarProducto={false} vacio="Este producto aún no tiene movimientos." />}
      </div>
    </>
  )
}

function Volver() {
  return <Link to="/admin/productos" className="mb-3 inline-block text-sm font-semibold text-hielo-texto hover:underline">← Productos</Link>
}
