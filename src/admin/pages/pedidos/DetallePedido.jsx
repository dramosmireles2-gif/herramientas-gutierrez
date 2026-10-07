import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { ESTADOS_PEDIDO, METODOS, entregaEstimada, operacionPedido, pasosDelFlujo, puedeCancelarse, reembolsoPendiente, siguienteEstado } from '../../store/pedidos'
import { useAvisos } from '../../components/Avisos'
import Confirmar from '../../components/Confirmar'
import Encabezado from '../../components/Encabezado'
import ImagenProducto from '../../components/ImagenProducto'
import Insignia from '../../components/Insignia'
import TablaMovimientos from '../../components/TablaMovimientos'
import { CheckIcon } from '../../../components/icons'
import { formatoFecha, formatoFechaHora, formatoMoneda } from '../../utils/formato'
import { InsigniasPedido } from './Pedidos'

// Texto del botón principal según el paso que sigue.
const ACCION = {
  preparando: 'Empezar a preparar',
  listo_para_recoger: 'Marcar listo para recoger',
  enviado: 'Marcar como enviado',
  entregado: 'Marcar como entregado',
}

function Pasos({ pedido }) {
  const pasos = pasosDelFlujo(pedido.metodo)
  const actual = pasos.indexOf(pedido.estado)
  if (pedido.estado === 'cancelado') return null
  return (
    <ol className="mb-6 grid grid-cols-4 gap-1" aria-label="Avance del pedido">
      {pasos.map((paso, i) => {
        const hecho = i <= actual
        return (
          <li key={paso} className="text-center" aria-current={i === actual ? 'step' : undefined}>
            <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${hecho ? 'bg-hielo text-cta-ink' : 'bg-blanco text-gris ring-1 ring-titanio/15'}`}>
              {i < actual ? <CheckIcon width={16} height={16} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`mt-1 block text-[0.7rem] leading-tight sm:text-xs ${i === actual ? 'font-bold text-titanio' : 'text-gris'}`}>{ESTADOS_PEDIDO[paso].etiqueta}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Tarjeta({ titulo, children }) {
  return (
    <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
      <h2 className="mb-3 text-xl uppercase text-titanio">{titulo}</h2>
      {children}
    </section>
  )
}

export default function DetallePedido() {
  const { id } = useParams()
  const { datos, esAdmin, usuario, ejecutar } = useAdmin()
  const avisar = useAvisos()
  const [guia, setGuia] = useState('')
  const [error, setError] = useState('')
  const [cancelando, setCancelando] = useState(false)
  const pedido = datos.pedidos.find((p) => p.id === id)

  if (!pedido) {
    return (
      <>
        <Volver />
        <Encabezado titulo="Pedido no encontrado" descripcion="Puede que se haya reiniciado el demo." />
      </>
    )
  }
  if (!esAdmin && pedido.sucursal_id !== usuario.sucursal_id) {
    return (
      <>
        <Volver />
        <Encabezado titulo={`Pedido ${pedido.folio}`} descripcion="Este pedido lo atiende otra sucursal." />
      </>
    )
  }

  const sucursal = datos.sucursales.find((s) => s.id === pedido.sucursal_id)
  const producto = (pid) => datos.productos.find((p) => p.id === pid)
  const siguiente = siguienteEstado(pedido)
  const tieneSobrePedido = pedido.items.some((it) => producto(it.producto_id)?.tipo === 'sobre_pedido')
  const movimientos = datos.movimientos.filter((m) => m.referencia === `Pedido ${pedido.folio}`)

  const aplicar = (accion, extra, mensaje) => {
    setError('')
    const op = operacionPedido(datos, pedido, accion, extra)
    if (op.error) return setError(op.error)
    const r = ejecutar({ movimientos: op.movimientos, cambios: op.cambios })
    if (!r.ok) {
      // Ej. sin existencia en la sucursal asignada: sugerir cómo resolverlo.
      return setError(`${r.error} Registra una entrada, haz un traspaso${esAdmin && pedido.estado === 'nuevo' ? ' o cambia la sucursal' : ''}.`)
    }
    avisar(mensaje(op))
    setGuia('')
  }

  const avanzar = () => aplicar('avanzar', { guia }, (op) =>
    op.destino === 'preparando'
      ? `${pedido.folio} en preparación: se descontaron las existencias de ${sucursal.nombre}.`
      : `${pedido.folio}: ${ESTADOS_PEDIDO[op.destino].etiqueta.toLowerCase()}.`)

  return (
    <>
      <Volver />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Encabezado titulo={`Pedido ${pedido.folio}`} />
          <p className="-mt-4 text-sm text-gris">{formatoFechaHora(pedido.fecha)} · {METODOS[pedido.metodo]} · {sucursal?.nombre}</p>
        </div>
        <InsigniasPedido pedido={pedido} />
      </div>

      <Pasos pedido={pedido} />

      {/* Acciones */}
      <section className="mb-5 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
        {pedido.estado === 'cancelado' ? (
          <p className="font-semibold text-titanio">Pedido cancelado.{movimientos.some((m) => m.tipo === 'cancelacion') && ' Las existencias regresaron a la sucursal.'}</p>
        ) : siguiente ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {siguiente === 'enviado' && (
              <div className="sm:w-64">
                <label htmlFor="guia" className="mb-1 block text-sm font-semibold text-titanio">Número de guía</label>
                <input id="guia" value={guia} onChange={(e) => setGuia(e.target.value)} maxLength={40} placeholder="Ej. 1Z999AA10123456784" className="h-12 w-full rounded-lg border border-gris/40 px-3 font-mono" />
              </div>
            )}
            <button type="button" onClick={avanzar} className="btn-primary h-12 text-lg">{ACCION[siguiente]}</button>
            {siguiente === 'preparando' && (
              <p className="text-sm text-gris">Al empezar se descuentan las existencias de {sucursal?.nombre}.</p>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-2 font-semibold text-titanio"><CheckIcon className="text-hielo-texto" /> Pedido entregado.</p>
        )}

        {error && <p role="alert" className="mt-3 rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-2 border-t border-fondo pt-4 empty:hidden">
          {pedido.estado_pago === 'pendiente' && pedido.estado !== 'cancelado' && (
            <button type="button" onClick={() => aplicar('marcar_pagado', {}, () => `${pedido.folio}: pago registrado.`)} className="btn h-10 px-3 text-sm text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">Marcar pagado</button>
          )}
          {reembolsoPendiente(pedido) && (
            <button type="button" onClick={() => aplicar('marcar_reembolsado', {}, () => `${pedido.folio}: reembolso registrado.`)} className="btn h-10 px-3 text-sm text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">Marcar reembolsado</button>
          )}
          {puedeCancelarse(pedido) && (
            <button type="button" onClick={() => setCancelando(true)} className="btn h-10 px-3 text-sm text-agotado ring-1 ring-agotado/30 hover:bg-agotado/10">Cancelar pedido</button>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] lg:items-start">
        <Tarjeta titulo="Productos">
          {tieneSobrePedido && (
            <p className="mb-3 rounded-lg bg-hielo/15 p-3 text-sm text-titanio">
              Incluye productos <strong>sobre pedido</strong>: los surte el proveedor de Monterrey. Entrega estimada: <strong>{formatoFecha(entregaEstimada(datos, pedido))}</strong>.
            </p>
          )}
          <ul className="divide-y divide-fondo">
            {pedido.items.map((it) => {
              const p = producto(it.producto_id)
              return (
                <li key={it.producto_id} className="flex items-center gap-3 py-3">
                  <ImagenProducto producto={p} className="w-14 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/admin/productos/${it.producto_id}`} className="font-semibold leading-snug hover:underline">{p?.nombre}</Link>
                    <p className="text-xs text-gris"><span className="font-mono">{p?.sku}</span> · {it.cantidad} × {formatoMoneda(it.precio)}</p>
                    {p?.tipo === 'sobre_pedido' && <Insignia tono="info" className="mt-1">Sobre pedido</Insignia>}
                  </div>
                  <span className="price shrink-0 text-lg text-titanio">{formatoMoneda(it.precio * it.cantidad)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-fondo pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="price text-base">{formatoMoneda(pedido.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Envío</dt><dd className="price text-base">{pedido.envio ? formatoMoneda(pedido.envio) : 'Gratis'}</dd></div>
            <div className="flex items-baseline justify-between pt-1"><dt className="font-bold">Total</dt><dd className="price text-2xl text-titanio">{formatoMoneda(pedido.total)}</dd></div>
          </dl>
        </Tarjeta>

        <div className="space-y-5">
          <Tarjeta titulo="Cliente">
            <p className="font-semibold">{pedido.cliente.nombre}</p>
            <p className="text-sm"><a href={`tel:${pedido.cliente.telefono}`} className="text-hielo-texto hover:underline">{pedido.cliente.telefono}</a></p>
            {pedido.cliente.correo && <p className="text-sm text-gris">{pedido.cliente.correo}</p>}
          </Tarjeta>

          <Tarjeta titulo={pedido.metodo === 'envio' ? 'Envío' : 'Recoger en tienda'}>
            {pedido.metodo === 'envio' ? (
              <>
                <p className="text-sm">{pedido.direccion_envio}</p>
                <p className="mt-2 text-sm text-gris">Guía: {pedido.guia_envio ? <span className="font-mono text-texto">{pedido.guia_envio}</span> : 'sin capturar'}</p>
              </>
            ) : (
              <p className="text-sm">Sucursal {sucursal?.nombre} · {sucursal?.horario}</p>
            )}
            {esAdmin && pedido.estado === 'nuevo' && (
              <div className="mt-3 border-t border-fondo pt-3">
                <label htmlFor="reasignar" className="mb-1 block text-sm font-semibold text-titanio">Sucursal que lo atiende</label>
                <select
                  id="reasignar"
                  value={pedido.sucursal_id}
                  onChange={(e) => aplicar('reasignar', { sucursal_id: e.target.value }, () => `${pedido.folio} reasignado a ${datos.sucursales.find((s) => s.id === e.target.value)?.nombre}.`)}
                  className="h-11 w-full rounded-lg border border-gris/40 bg-blanco px-3"
                >
                  {datos.sucursales.filter((s) => s.tipo === 'sucursal' && s.activa).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
            )}
          </Tarjeta>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-xl uppercase text-titanio">Movimientos de inventario del pedido</h2>
        <TablaMovimientos movimientos={movimientos} vacio="Todavía no mueve inventario: se descuenta al empezar a prepararlo." />
      </section>

      <Confirmar
        abierto={cancelando}
        titulo={`¿Cancelar ${pedido.folio}?`}
        mensaje={
          ['preparando', 'listo_para_recoger'].includes(pedido.estado)
            ? `Las existencias regresan a ${sucursal?.nombre}.${pedido.estado_pago === 'pagado' ? ' Quedará un reembolso pendiente.' : ''}`
            : `El pedido todavía no descontaba existencias.${pedido.estado_pago === 'pagado' ? ' Quedará un reembolso pendiente.' : ''}`
        }
        textoConfirmar="Sí, cancelar pedido"
        peligro
        onConfirmar={() => {
          setCancelando(false)
          aplicar('cancelar', {}, (op) => `${pedido.folio} cancelado.${op.regresoExistencias ? ' Las existencias regresaron.' : ''}`)
        }}
        onCancelar={() => setCancelando(false)}
      />
    </>
  )
}

function Volver() {
  return <Link to="/admin/pedidos" className="mb-3 inline-block text-sm font-semibold text-hielo-texto hover:underline">← Pedidos</Link>
}
