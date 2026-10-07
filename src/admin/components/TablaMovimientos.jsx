import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../store/AdminStore'
import { TIPOS_MOVIMIENTO } from '../store/movimientos'
import { formatoCantidad, formatoFechaHora } from '../utils/formato'
import Insignia from './Insignia'

const TONO_TIPO = { entrada: 'info', traspaso_entrada: 'info', devolucion: 'info', cancelacion: 'info', ajuste: 'oscuro', venta: 'neutro', traspaso_salida: 'neutro' }
const POR_PAGINA = 40

function Cantidad({ valor }) {
  return <span className={`price text-lg ${valor > 0 ? 'text-hielo-texto' : 'text-titanio'}`}>{formatoCantidad(valor)}</span>
}

/** Historial de movimientos (kardex). En móvil cada movimiento es una tarjeta. */
export default function TablaMovimientos({ movimientos, mostrarProducto = true, vacio = 'No hay movimientos con estos filtros.' }) {
  const { datos } = useAdmin()
  const [mostrar, setMostrar] = useState(POR_PAGINA)
  const producto = (id) => datos.productos.find((p) => p.id === id)
  const sucursal = (id) => datos.sucursales.find((s) => s.id === id)?.nombre ?? id
  const visibles = movimientos.slice(0, mostrar)

  if (!movimientos.length) {
    return <p className="rounded-xl bg-blanco p-8 text-center text-gris shadow-sm ring-1 ring-titanio/5">{vacio}</p>
  }

  return (
    <div>
      {/* Escritorio */}
      <div className="hidden overflow-x-auto rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5 md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-fondo text-xs uppercase tracking-wide text-gris">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Fecha</th>
              {mostrarProducto && <th scope="col" className="px-4 py-3 font-bold">Producto</th>}
              <th scope="col" className="px-4 py-3 font-bold">Sucursal</th>
              <th scope="col" className="px-4 py-3 font-bold">Tipo</th>
              <th scope="col" className="px-4 py-3 text-right font-bold">Cantidad</th>
              <th scope="col" className="px-4 py-3 text-center font-bold">Existencia</th>
              <th scope="col" className="px-4 py-3 font-bold">Motivo / referencia</th>
              <th scope="col" className="px-4 py-3 font-bold">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fondo">
            {visibles.map((m) => {
              const p = producto(m.producto_id)
              return (
                <tr key={m.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-gris">{formatoFechaHora(m.fecha)}</td>
                  {mostrarProducto && (
                    <td className="px-4 py-3">
                      <Link to={`/admin/productos/${m.producto_id}`} className="font-semibold hover:text-hielo-texto hover:underline">{p?.nombre ?? m.producto_id}</Link>
                      <span className="block text-xs text-gris">{p?.sku}</span>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3">{sucursal(m.sucursal_id)}</td>
                  <td className="px-4 py-3"><Insignia tono={TONO_TIPO[m.tipo]}>{TIPOS_MOVIMIENTO[m.tipo]?.etiqueta ?? m.tipo}</Insignia></td>
                  <td className="px-4 py-3 text-right"><Cantidad valor={m.cantidad} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-center tabular-nums text-gris">{m.existencia_antes} → <strong className="text-titanio">{m.existencia_despues}</strong></td>
                  <td className="px-4 py-3">
                    {m.motivo && <span className="block font-semibold">{m.motivo}</span>}
                    {m.referencia && <span className="block text-gris">{m.referencia}</span>}
                    {!m.motivo && !m.referencia && <span className="text-gris">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{m.usuario}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <ul className="space-y-2 md:hidden">
        {visibles.map((m) => {
          const p = producto(m.producto_id)
          return (
            <li key={m.id} className="rounded-xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Insignia tono={TONO_TIPO[m.tipo]}>{TIPOS_MOVIMIENTO[m.tipo]?.etiqueta ?? m.tipo}</Insignia>
                  {mostrarProducto && (
                    <Link to={`/admin/productos/${m.producto_id}`} className="mt-1 block font-semibold leading-snug">{p?.nombre ?? m.producto_id}</Link>
                  )}
                  <p className="text-xs text-gris">{sucursal(m.sucursal_id)} · {formatoFechaHora(m.fecha)}</p>
                </div>
                <div className="shrink-0 text-right">
                  <Cantidad valor={m.cantidad} />
                  <p className="text-xs tabular-nums text-gris">{m.existencia_antes} → {m.existencia_despues}</p>
                </div>
              </div>
              {(m.motivo || m.referencia) && (
                <p className="mt-2 text-sm">
                  {m.motivo && <strong>{m.motivo}</strong>}
                  {m.motivo && m.referencia && ' · '}
                  {m.referencia && <span className="text-gris">{m.referencia}</span>}
                </p>
              )}
              <p className="mt-1 text-xs text-gris">Por {m.usuario}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 text-center text-sm text-gris">
        Viendo {visibles.length} de {movimientos.length}
        {visibles.length < movimientos.length && (
          <button type="button" onClick={() => setMostrar((n) => n + POR_PAGINA)} className="btn mx-auto mt-2 flex bg-titanio text-blanco hover:bg-texto">
            Ver más movimientos
          </button>
        )}
      </div>
    </div>
  )
}
