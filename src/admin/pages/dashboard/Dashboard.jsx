import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { POR_ATENDER } from '../../store/pedidos'
import Encabezado from '../../components/Encabezado'
import GraficaVentas from '../../components/GraficaVentas'
import Insignia from '../../components/Insignia'
import { ChevronRightIcon } from '../../../components/icons'
import { estadoExistencia, valorInventario } from '../../utils/existencias'
import { formatoFechaHora, formatoMoneda, formatoMonedaCompacta } from '../../utils/formato'
import { serieDiaria, ventas, ventasDelMes } from '../../utils/ventas'

const mes = new Intl.DateTimeFormat('es-MX', { month: 'long' })

function Tarjeta({ etiqueta, valor, detalle, a }) {
  return (
    <Link to={a} className="group flex min-w-0 flex-col rounded-xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5 transition hover:ring-hielo sm:p-5">
      <span className="text-sm font-semibold text-gris">{etiqueta}</span>
      {/* Cifras grandes con números proporcionales (sin tabular-nums) */}
      <span className="mt-1 break-words font-condensed text-3xl leading-none text-titanio sm:text-4xl">{valor}</span>
      {detalle && <span className="mt-2 text-xs text-gris">{detalle}</span>}
      <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-bold text-hielo-texto">
        Ver detalle <ChevronRightIcon width={14} height={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function Atencion({ titulo, cantidad, a, vacio, children }) {
  return (
    // min-w-0: sin esto, el texto truncado de cada fila estira la columna de la cuadrícula
    <section className="min-w-0 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-sans text-base font-bold text-titanio [font-stretch:normal]">
          {titulo}
          <span className={`rounded-full px-2 py-0.5 text-xs ${cantidad ? 'bg-titanio text-blanco' : 'bg-fondo text-gris'}`}>{cantidad}</span>
        </h3>
        {cantidad > 0 && <Link to={a} className="text-xs font-bold text-hielo-texto hover:underline">Ver todos</Link>}
      </div>
      {cantidad === 0 ? <p className="py-2 text-sm text-gris">{vacio}</p> : <ul className="divide-y divide-fondo">{children}</ul>}
    </section>
  )
}

export default function Dashboard() {
  const { datos, usuario, esAdmin, sucursalFiltro } = useAdmin()
  const enAlcance = (id) => sucursalFiltro === 'todas' || id === sucursalFiltro
  const nombre = (id) => datos.sucursales.find((s) => s.id === id)?.nombre ?? id
  const producto = (id) => datos.productos.find((p) => p.id === id)

  const listaVentas = useMemo(() => ventas(datos, sucursalFiltro), [datos, sucursalFiltro])
  const delMes = ventasDelMes(listaVentas)
  const serie = useMemo(() => serieDiaria(listaVentas, 30), [listaVentas])

  const pedidosAtender = datos.pedidos.filter((p) => POR_ATENDER.includes(p.estado) && enAlcance(p.sucursal_id))
  const nuevos = pedidosAtender.filter((p) => p.estado === 'nuevo').sort((a, b) => b.fecha.localeCompare(a.fecha))

  const filasInventariadas = datos.inventario.filter((f) => enAlcance(f.sucursal_id) && producto(f.producto_id)?.tipo === 'inventariado' && producto(f.producto_id)?.activo)
  const agotadas = filasInventariadas.filter((f) => f.cantidad === 0)
  const bajas = filasInventariadas.filter((f) => estadoExistencia(f) === 'bajo')
  const productosConAlerta = new Set([...agotadas, ...bajas].map((f) => f.producto_id)).size

  const porRecibir = datos.traspasos.filter((t) => t.estado === 'enviado' && enAlcance(t.destino_id))
  const alcance = sucursalFiltro === 'todas' ? 'las 5 sucursales' : nombre(sucursalFiltro)

  return (
    <>
      <Encabezado
        titulo="Dashboard"
        descripcion={esAdmin ? `Tu negocio de un vistazo en ${alcance}.` : `Hola ${usuario.nombre.split(' ')[0]}, esto es lo que pasa en ${alcance}.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tarjeta
          etiqueta={`Ventas de ${mes.format(new Date())}`}
          valor={formatoMonedaCompacta(delMes.total)}
          detalle={`En línea ${formatoMoneda(delMes.enLinea)} · Mostrador ${formatoMoneda(delMes.mostrador)}`}
          a="/admin/pedidos"
        />
        <Tarjeta etiqueta="Pedidos por atender" valor={pedidosAtender.length} detalle={`${nuevos.length} ${nuevos.length === 1 ? 'nuevo' : 'nuevos'}`} a="/admin/pedidos?estado=por_atender" />
        <Tarjeta
          etiqueta="Productos por resurtir"
          valor={productosConAlerta}
          detalle={`Por sucursal: ${agotadas.length} agotados y ${bajas.length} bajo el mínimo`}
          a="/admin/inventario?baja=1"
        />
        <Tarjeta
          etiqueta="Valor del inventario"
          valor={formatoMonedaCompacta(valorInventario(datos.inventario, datos.productos, sucursalFiltro))}
          detalle={`${formatoMoneda(valorInventario(datos.inventario, datos.productos, sucursalFiltro))} a precio de venta`}
          a="/admin/inventario"
        />
      </div>

      <section className="mt-5 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
        <GraficaVentas serie={serie} titulo={`Ventas por día · ${alcance}`} />
        <p className="mt-2 text-xs text-gris">Incluye pedidos en línea pagados y ventas de mostrador (valuadas al precio vigente en el demo).</p>
      </section>

      <h2 className="mb-3 mt-8 text-2xl uppercase text-titanio">Requiere atención</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Atencion titulo="Pedidos nuevos" cantidad={nuevos.length} a="/admin/pedidos?estado=nuevo" vacio="No hay pedidos nuevos.">
          {nuevos.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link to={`/admin/pedidos/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-hielo-texto">
                <span className="min-w-0">
                  <span className="price block text-base text-titanio">{p.folio}</span>
                  <span className="block truncate text-xs text-gris">{p.cliente.nombre} · {nombre(p.sucursal_id)} · {formatoFechaHora(p.fecha)}</span>
                </span>
                <span className="price shrink-0 text-base">{formatoMoneda(p.total)}</span>
              </Link>
            </li>
          ))}
        </Atencion>

        <Atencion titulo="Productos agotados" cantidad={agotadas.length} a="/admin/inventario?baja=1" vacio="Nada agotado. ¡Bien!">
          {agotadas.slice(0, 5).map((f) => (
            <li key={`${f.producto_id}-${f.sucursal_id}`}>
              <Link to={`/admin/productos/${f.producto_id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-hielo-texto">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{producto(f.producto_id)?.nombre}</span>
                  <span className="block text-xs text-gris">{nombre(f.sucursal_id)}</span>
                </span>
                <Insignia tono="agotado">0</Insignia>
              </Link>
            </li>
          ))}
        </Atencion>

        <Atencion titulo="Traspasos por recibir" cantidad={porRecibir.length} a="/admin/traspasos" vacio="No hay mercancía en tránsito.">
          {porRecibir.map((t) => (
            <li key={t.id}>
              <Link to="/admin/traspasos" className="flex items-center justify-between gap-3 py-2.5 hover:text-hielo-texto">
                <span className="min-w-0">
                  <span className="price block text-base text-titanio">{t.folio}</span>
                  <span className="block text-xs text-gris">{nombre(t.origen_id)} → {nombre(t.destino_id)}</span>
                </span>
                <Insignia tono="info">En tránsito</Insignia>
              </Link>
            </li>
          ))}
        </Atencion>
      </div>
    </>
  )
}
