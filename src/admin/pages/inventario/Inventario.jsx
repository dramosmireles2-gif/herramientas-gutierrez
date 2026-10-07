import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import Encabezado from '../../components/Encabezado'
import FormularioMovimiento from '../../components/FormularioMovimiento'
import { CampoBusqueda, FiltroSelect, escribirFiltro, leerFiltros } from '../../components/Filtros'
import { IconoTraspasos } from '../../components/iconos'
import { PlusIcon } from '../../../components/icons'
import { estadoExistencia, filaInventario } from '../../utils/existencias'
import { coincideBusqueda } from '../../utils/productos'

// Colores de celda: rojo bajo el mínimo, gris en cero (sección 4.4).
const CELDA = {
  ok: 'text-titanio hover:bg-fondo',
  bajo: 'bg-agotado/10 font-bold text-agotado hover:bg-agotado/15',
  agotado: 'bg-fondo text-gris hover:bg-titanio/10',
}

export default function Inventario() {
  const { datos, esAdmin, usuario, sucursalFiltro } = useAdmin()
  const [params, setParams] = useSearchParams()
  const f = leerFiltros(params, ['q', 'categoria', 'baja'])
  const filtrar = (clave) => (valor) => escribirFiltro(params, setParams, clave, valor)
  const [accion, setAccion] = useState(null) // { modo, productoId?, sucursalId? }

  const columnas = datos.sucursales.filter((s) => s.activa && (sucursalFiltro === 'todas' || s.id === sucursalFiltro))
  const puedeMover = (sucursalId) => esAdmin || sucursalId === usuario.sucursal_id

  const filas = useMemo(() => datos.productos
    .filter((p) => p.activo && coincideBusqueda(p, f.q) && (!f.categoria || p.categoria_id === f.categoria))
    .map((p) => ({ p, celdas: columnas.map((s) => filaInventario(datos.inventario, p.id, s.id)) }))
    .filter(({ p, celdas }) => celdas.some(Boolean) && (!f.baja || (p.tipo === 'inventariado' && celdas.some((c) => c && estadoExistencia(c) !== 'ok'))))
    .sort((a, b) => a.p.nombre.localeCompare(b.p.nombre, 'es')),
  [datos.productos, datos.inventario, columnas, f.q, f.categoria, f.baja])

  const bajos = filas.reduce((n, { p, celdas }) => n + (p.tipo === 'inventariado' ? celdas.filter((c) => c && estadoExistencia(c) === 'bajo').length : 0), 0)
  const ceros = filas.reduce((n, { p, celdas }) => n + (p.tipo === 'inventariado' ? celdas.filter((c) => c && c.cantidad === 0).length : 0), 0)

  return (
    <>
      <Encabezado
        titulo="Inventario"
        descripcion="Existencias de cada producto por sucursal. Toca una celda para ajustarla."
        acciones={
          <>
            <button type="button" onClick={() => setAccion({ modo: 'entrada' })} className="btn-primary"><PlusIcon width={20} height={20} /> Registrar entrada</button>
            <button type="button" onClick={() => setAccion({ modo: 'ajuste' })} className="btn bg-blanco text-titanio ring-1 ring-titanio/15 hover:bg-fondo">Ajuste</button>
            <Link to="/admin/traspasos/nuevo" className="btn bg-blanco text-titanio ring-1 ring-titanio/15 hover:bg-fondo"><IconoTraspasos width={20} height={20} /> Traspaso</Link>
          </>
        }
      />

      <div className="mb-3 grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
        <CampoBusqueda id="buscar-inv" valor={f.q} onCambiar={filtrar('q')} placeholder="Buscar por nombre, SKU o marca" />
        <FiltroSelect id="inv-categoria" etiqueta="Categoría" valor={f.categoria} onCambiar={filtrar('categoria')}
          opciones={[{ valor: '', etiqueta: 'Todas las categorías' }, ...datos.categorias.map((c) => ({ valor: c.id, etiqueta: c.nombre }))]} />
        <label className={`flex h-11 cursor-pointer items-center gap-2 rounded-lg px-4 text-sm font-bold ring-1 ${f.baja ? 'bg-agotado/10 text-agotado ring-agotado/40' : 'bg-blanco text-titanio ring-titanio/15'}`}>
          <input type="checkbox" checked={Boolean(f.baja)} onChange={(e) => filtrar('baja')(e.target.checked ? '1' : '')} className="h-4 w-4 accent-agotado" />
          Solo existencia baja
        </label>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gris" aria-live="polite">
        <span>{filas.length} {filas.length === 1 ? 'producto' : 'productos'}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-agotado/20 ring-1 ring-agotado/40" aria-hidden="true" /> Bajo el mínimo ({bajos})</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-fondo ring-1 ring-titanio/20" aria-hidden="true" /> En cero ({ceros})</span>
      </div>

      {filas.length === 0 ? (
        <p className="rounded-xl bg-blanco p-8 text-center text-gris shadow-sm ring-1 ring-titanio/5">
          {f.baja ? 'Nada por resurtir: ningún producto está bajo su mínimo.' : 'Ningún producto coincide con la búsqueda.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5">
          <table className="w-full text-sm">
            <thead className="border-b border-fondo text-xs uppercase tracking-wide text-gris">
              <tr>
                <th scope="col" className="sticky left-0 z-10 min-w-[11rem] bg-blanco px-3 py-3 text-left font-bold">Producto</th>
                {columnas.map((s) => (
                  <th key={s.id} scope="col" className="min-w-[4.5rem] px-2 py-3 text-center font-bold">
                    {s.tipo === 'proveedor' ? 'Proveedor' : s.nombre.replace(' de los Garza', '')}
                  </th>
                ))}
                {columnas.length > 1 && <th scope="col" className="px-3 py-3 text-center font-bold">Total</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-fondo">
              {filas.map(({ p, celdas }) => (
                <tr key={p.id}>
                  <th scope="row" className="sticky left-0 z-10 bg-blanco px-3 py-2 text-left font-normal shadow-[1px_0_0_rgba(43,52,64,0.08)]">
                    <Link to={`/admin/productos/${p.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-hielo-texto hover:underline">{p.nombre}</Link>
                    <span className="font-mono text-xs text-gris">{p.sku}</span>
                  </th>
                  {celdas.map((c, i) => {
                    const s = columnas[i]
                    if (!c) return <td key={s.id} className="px-2 py-2 text-center text-gris">—</td>
                    const estado = p.tipo === 'sobre_pedido' ? 'ok' : estadoExistencia(c)
                    const etiqueta = `${p.nombre} en ${s.nombre}: ${c.cantidad} (mínimo ${c.minimo})`
                    return (
                      <td key={s.id} className="p-1 text-center">
                        {puedeMover(s.id) ? (
                          <button
                            type="button"
                            onClick={() => setAccion({ modo: 'ajuste', productoId: p.id, sucursalId: s.id })}
                            className={`price h-11 w-full rounded-md text-lg ${CELDA[estado]}`}
                            aria-label={`${etiqueta}. Ajustar`}
                            title={`Mínimo ${c.minimo}`}
                          >
                            {c.cantidad}
                          </button>
                        ) : (
                          <span className={`price flex h-11 items-center justify-center rounded-md text-lg ${CELDA[estado]}`} title={etiqueta}>{c.cantidad}</span>
                        )}
                      </td>
                    )
                  })}
                  {columnas.length > 1 && (
                    <td className="price px-3 py-2 text-center text-lg text-titanio">{celdas.reduce((n, c) => n + (c?.cantidad ?? 0), 0)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormularioMovimiento
        abierto={Boolean(accion)}
        modo={accion?.modo}
        productoId={accion?.productoId}
        sucursalId={accion?.sucursalId}
        onCerrar={() => setAccion(null)}
      />
    </>
  )
}
