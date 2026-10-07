import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import Encabezado from '../../components/Encabezado'
import ImagenProducto from '../../components/ImagenProducto'
import Insignia, { InsigniaExistencia } from '../../components/Insignia'
import { CampoBusqueda, FiltroSelect, escribirFiltro, leerFiltros } from '../../components/Filtros'
import { PlusIcon } from '../../../components/icons'
import { formatoMoneda } from '../../utils/formato'
import { ESTADOS_FILTRO, coincideBusqueda, resumenExistencia } from '../../utils/productos'

function Existencia({ resumen }) {
  if (resumen.estado === 'sobre_pedido') return <Insignia tono="info">Sobre pedido</Insignia>
  if (resumen.estado === 'sin_fila') return <span className="text-gris">—</span>
  return (
    <span className="inline-flex items-center gap-2">
      <span className="price text-lg text-titanio">{resumen.total}</span>
      <InsigniaExistencia estado={resumen.estado} />
    </span>
  )
}

function Precio({ producto }) {
  return producto.precio_oferta ? (
    <span>
      <span className="price block text-base text-titanio">{formatoMoneda(producto.precio_oferta)}</span>
      <span className="text-xs text-gris line-through">{formatoMoneda(producto.precio)}</span>
    </span>
  ) : (
    <span className="price text-base text-titanio">{formatoMoneda(producto.precio)}</span>
  )
}

export default function Productos() {
  const { datos, esAdmin, sucursalFiltro } = useAdmin()
  const [params, setParams] = useSearchParams()
  const f = leerFiltros(params, ['q', 'categoria', 'tipo', 'estado'])
  const filtrar = (clave) => (valor) => escribirFiltro(params, setParams, clave, valor)

  const filas = useMemo(() => datos.productos
    .map((p) => ({ p, r: resumenExistencia(datos.inventario, p, sucursalFiltro) }))
    .filter(({ p, r }) =>
      coincideBusqueda(p, f.q) &&
      (!f.categoria || p.categoria_id === f.categoria) &&
      (!f.tipo || p.tipo === f.tipo) &&
      (!f.estado ||
        (f.estado === 'activo' && p.activo) ||
        (f.estado === 'inactivo' && !p.activo) ||
        (f.estado === 'agotado' && r.estado === 'agotado') ||
        (f.estado === 'bajo' && (r.estado === 'bajo' || r.estado === 'agotado'))))
    .sort((a, b) => a.p.nombre.localeCompare(b.p.nombre, 'es')),
  [datos.productos, datos.inventario, sucursalFiltro, f.q, f.categoria, f.tipo, f.estado])

  const categoria = (id) => datos.categorias.find((c) => c.id === id)?.nombre
  const alcance = sucursalFiltro === 'todas' ? 'todas las sucursales' : datos.sucursales.find((s) => s.id === sucursalFiltro)?.nombre

  return (
    <>
      <Encabezado
        titulo="Productos"
        descripcion={`Catálogo con precios y existencias en ${alcance}.`}
        acciones={esAdmin && (
          <Link to="/admin/productos/nuevo" className="btn-primary"><PlusIcon width={20} height={20} /> Nuevo producto</Link>
        )}
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <CampoBusqueda id="buscar-producto" valor={f.q} onCambiar={filtrar('q')} placeholder="Buscar por nombre, SKU o marca" />
        <FiltroSelect id="f-categoria" etiqueta="Categoría" valor={f.categoria} onCambiar={filtrar('categoria')}
          opciones={[{ valor: '', etiqueta: 'Todas las categorías' }, ...datos.categorias.map((c) => ({ valor: c.id, etiqueta: c.nombre }))]} />
        <FiltroSelect id="f-tipo" etiqueta="Tipo" valor={f.tipo} onCambiar={filtrar('tipo')}
          opciones={[{ valor: '', etiqueta: 'Todos los tipos' }, { valor: 'inventariado', etiqueta: 'Inventariados' }, { valor: 'sobre_pedido', etiqueta: 'Sobre pedido' }]} />
        <FiltroSelect id="f-estado" etiqueta="Estado" valor={f.estado} onCambiar={filtrar('estado')} opciones={ESTADOS_FILTRO} />
      </div>
      <p className="mb-3 text-sm text-gris" aria-live="polite">{filas.length} {filas.length === 1 ? 'producto' : 'productos'}</p>

      {filas.length === 0 ? (
        <p className="rounded-xl bg-blanco p-8 text-center text-gris shadow-sm ring-1 ring-titanio/5">Ningún producto coincide con estos filtros.</p>
      ) : (
        <>
          {/* Escritorio */}
          <div className="hidden overflow-x-auto rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-fondo text-xs uppercase tracking-wide text-gris">
                <tr>
                  <th scope="col" className="w-20 px-4 py-3 font-bold"><span className="sr-only">Foto</span></th>
                  <th scope="col" className="px-4 py-3 font-bold">Producto</th>
                  <th scope="col" className="px-4 py-3 font-bold">SKU</th>
                  <th scope="col" className="px-4 py-3 font-bold">Precio</th>
                  <th scope="col" className="px-4 py-3 font-bold">Existencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fondo">
                {filas.map(({ p, r }) => (
                  <tr key={p.id} className={`hover:bg-fondo/60 ${p.activo ? '' : 'opacity-60'}`}>
                    <td className="px-4 py-2"><ImagenProducto producto={p} className="w-14" /></td>
                    <td className="px-4 py-2">
                      <Link to={`/admin/productos/${p.id}`} className="font-semibold hover:text-hielo-texto hover:underline">{p.nombre}</Link>
                      <span className="block text-xs text-gris">{p.marca} · {categoria(p.categoria_id)}{!p.activo && ' · Inactivo'}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs">{p.sku}</td>
                    <td className="whitespace-nowrap px-4 py-2"><Precio producto={p} /></td>
                    <td className="whitespace-nowrap px-4 py-2"><Existencia resumen={r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil */}
          <ul className="space-y-2 md:hidden">
            {filas.map(({ p, r }) => (
              <li key={p.id} className={`relative flex gap-3 rounded-xl bg-blanco p-3 shadow-sm ring-1 ring-titanio/5 ${p.activo ? '' : 'opacity-60'}`}>
                <ImagenProducto producto={p} className="w-20 shrink-0" />
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/productos/${p.id}`} className="line-clamp-2 font-semibold leading-snug after:absolute after:inset-0">{p.nombre}</Link>
                  <p className="text-xs text-gris">{p.marca} · <span className="font-mono">{p.sku}</span></p>
                  <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                    <Precio producto={p} />
                    <Existencia resumen={r} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
