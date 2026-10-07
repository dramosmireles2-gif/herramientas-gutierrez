import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { ESTADOS_PAGO, ESTADOS_PEDIDO, METODOS, POR_ATENDER, reembolsoPendiente } from '../../store/pedidos'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import { CampoBusqueda, FiltroSelect, escribirFiltro, leerFiltros } from '../../components/Filtros'
import { formatoFechaHora, formatoMoneda } from '../../utils/formato'

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'por_atender', etiqueta: 'Por atender' },
  ...Object.entries(ESTADOS_PEDIDO).map(([valor, e]) => ({ valor, etiqueta: e.etiqueta })),
]

export function InsigniasPedido({ pedido }) {
  const e = ESTADOS_PEDIDO[pedido.estado]
  const pago = ESTADOS_PAGO[pedido.estado_pago]
  return (
    <span className="flex flex-wrap gap-1">
      <Insignia tono={e.tono}>{e.etiqueta}</Insignia>
      {/* El pago solo se señala cuando no es el caso normal (pagado) */}
      {reembolsoPendiente(pedido)
        ? <Insignia tono="bajo">Reembolso pendiente</Insignia>
        : pedido.estado_pago !== 'pagado' && <Insignia tono={pago.tono}>{pago.etiqueta}</Insignia>}
    </span>
  )
}

export default function Pedidos() {
  const { datos, sucursalFiltro } = useAdmin()
  const [params, setParams] = useSearchParams()
  const f = leerFiltros(params, ['q', 'estado', 'metodo'])
  const filtrar = (clave) => (valor) => escribirFiltro(params, setParams, clave, valor)
  const sucursal = (id) => datos.sucursales.find((s) => s.id === id)?.nombre

  const lista = useMemo(() => {
    const q = f.q.trim().toLowerCase()
    return datos.pedidos
      .filter((p) =>
        (sucursalFiltro === 'todas' || p.sucursal_id === sucursalFiltro) &&
        (!f.estado || (f.estado === 'por_atender' ? POR_ATENDER.includes(p.estado) : p.estado === f.estado)) &&
        (!f.metodo || p.metodo === f.metodo) &&
        (!q || p.folio.toLowerCase().includes(q) || p.cliente.nombre.toLowerCase().includes(q) || p.cliente.telefono.includes(q)))
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [datos.pedidos, sucursalFiltro, f.q, f.estado, f.metodo])

  const porAtender = datos.pedidos.filter((p) => POR_ATENDER.includes(p.estado) && (sucursalFiltro === 'todas' || p.sucursal_id === sucursalFiltro)).length

  return (
    <>
      <Encabezado titulo="Pedidos" descripcion={`Pedidos de la tienda en línea. ${porAtender} por atender.`} />

      <div className="mb-3 grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
        <CampoBusqueda id="buscar-pedido" valor={f.q} onCambiar={filtrar('q')} placeholder="Buscar por folio, cliente o teléfono" />
        <FiltroSelect id="ped-estado" etiqueta="Estado" valor={f.estado} onCambiar={filtrar('estado')} opciones={OPCIONES_ESTADO} />
        <FiltroSelect id="ped-metodo" etiqueta="Método" valor={f.metodo} onCambiar={filtrar('metodo')}
          opciones={[{ valor: '', etiqueta: 'Envío y recoger' }, ...Object.entries(METODOS).map(([valor, etiqueta]) => ({ valor, etiqueta }))]} />
      </div>
      <p className="mb-3 text-sm text-gris" aria-live="polite">{lista.length} {lista.length === 1 ? 'pedido' : 'pedidos'}</p>

      {lista.length === 0 ? (
        <p className="rounded-xl bg-blanco p-8 text-center text-gris shadow-sm ring-1 ring-titanio/5">Ningún pedido coincide con estos filtros.</p>
      ) : (
        <>
          {/* Escritorio */}
          <div className="hidden overflow-x-auto rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5 md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-fondo text-xs uppercase tracking-wide text-gris">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">Folio</th>
                  <th scope="col" className="px-4 py-3 font-bold">Cliente</th>
                  <th scope="col" className="px-4 py-3 font-bold">Método</th>
                  <th scope="col" className="px-4 py-3 font-bold">Sucursal</th>
                  <th scope="col" className="px-4 py-3 text-right font-bold">Total</th>
                  <th scope="col" className="px-4 py-3 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fondo">
                {lista.map((p) => (
                  <tr key={p.id} className={`hover:bg-fondo/60 ${POR_ATENDER.includes(p.estado) ? '' : 'text-gris'}`}>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link to={`/admin/pedidos/${p.id}`} className="price text-base text-titanio hover:text-hielo-texto hover:underline">{p.folio}</Link>
                      <span className="block text-xs text-gris">{formatoFechaHora(p.fecha)}</span>
                    </td>
                    <td className="px-4 py-3 text-texto">{p.cliente.nombre}</td>
                    <td className="whitespace-nowrap px-4 py-3">{METODOS[p.metodo]}</td>
                    <td className="whitespace-nowrap px-4 py-3">{sucursal(p.sucursal_id)}</td>
                    <td className="price whitespace-nowrap px-4 py-3 text-right text-base text-titanio">{formatoMoneda(p.total)}</td>
                    <td className="px-4 py-3"><InsigniasPedido pedido={p} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil */}
          <ul className="space-y-2 md:hidden">
            {lista.map((p) => (
              <li key={p.id} className="relative rounded-xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/admin/pedidos/${p.id}`} className="price text-lg text-titanio after:absolute after:inset-0">{p.folio}</Link>
                    <p className="truncate font-semibold">{p.cliente.nombre}</p>
                    <p className="text-xs text-gris">{METODOS[p.metodo]} · {sucursal(p.sucursal_id)} · {formatoFechaHora(p.fecha)}</p>
                  </div>
                  <span className="price shrink-0 text-lg text-titanio">{formatoMoneda(p.total)}</span>
                </div>
                <div className="mt-2"><InsigniasPedido pedido={p} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
