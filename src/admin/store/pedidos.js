// Flujo de pedidos (sección 4.7). Funciones puras: describen qué cambia y la UI lo aplica con ejecutar(),
// así movimientos de inventario y estado del pedido se guardan juntos o no se guarda nada.
//
//  Recoger: nuevo → preparando → listo_para_recoger → entregado
//  Envío:   nuevo → preparando → enviado (con guía) → entregado
//  Cancelar (antes de enviar/entregar): si ya se había descontado, regresa existencias.
//  Al pasar a "preparando" se descuenta la existencia de la sucursal asignada (venta).
//  Los productos sobre pedido no descuentan de la sucursal: los surte el proveedor.

export const ESTADOS_PEDIDO = {
  nuevo: { etiqueta: 'Nuevo', tono: 'info' },
  preparando: { etiqueta: 'Preparando', tono: 'oscuro' },
  listo_para_recoger: { etiqueta: 'Listo para recoger', tono: 'oscuro' },
  enviado: { etiqueta: 'Enviado', tono: 'oscuro' },
  entregado: { etiqueta: 'Entregado', tono: 'neutro' },
  cancelado: { etiqueta: 'Cancelado', tono: 'neutro' },
}

export const ESTADOS_PAGO = {
  pagado: { etiqueta: 'Pagado', tono: 'ok' },
  pendiente: { etiqueta: 'Pago pendiente', tono: 'bajo' },
  reembolsado: { etiqueta: 'Reembolsado', tono: 'neutro' },
}

export const METODOS = { recoger: 'Recoger en tienda', envio: 'Envío a domicilio' }

/** Pedidos que todavía requieren que alguien haga algo. */
export const POR_ATENDER = ['nuevo', 'preparando', 'listo_para_recoger']

// Estados en los que la existencia ya se descontó de la sucursal.
const DESCONTADO = ['preparando', 'listo_para_recoger', 'enviado', 'entregado']

export const pasosDelFlujo = (metodo) =>
  metodo === 'envio' ? ['nuevo', 'preparando', 'enviado', 'entregado'] : ['nuevo', 'preparando', 'listo_para_recoger', 'entregado']

/** Siguiente estado del flujo normal (o null si ya terminó o está cancelado). */
export function siguienteEstado(pedido) {
  if (pedido.estado === 'cancelado') return null
  const pasos = pasosDelFlujo(pedido.metodo)
  return pasos[pasos.indexOf(pedido.estado) + 1] ?? null
}

export const puedeCancelarse = (pedido) => ['nuevo', 'preparando', 'listo_para_recoger'].includes(pedido.estado)
export const reembolsoPendiente = (pedido) => pedido.estado === 'cancelado' && pedido.estado_pago === 'pagado'

const esInventariado = (datos, productoId) => datos.productos.find((p) => p.id === productoId)?.tipo === 'inventariado'
const actualizarPedido = (id, cambios) => (d) => ({ pedidos: d.pedidos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) })

/**
 * Operación para ejecutar(): { movimientos, cambios } o { error }.
 * @param {'avanzar'|'cancelar'|'marcar_pagado'|'marcar_reembolsado'|'reasignar'} accion
 * @param {object} extra { guia } al enviar, { sucursal_id } al reasignar
 */
export function operacionPedido(datos, pedido, accion, extra = {}) {
  const referencia = `Pedido ${pedido.folio}`

  if (accion === 'avanzar') {
    const destino = siguienteEstado(pedido)
    if (!destino) return { error: 'Este pedido ya no tiene un siguiente paso.' }
    if (destino === 'enviado' && !extra.guia?.trim()) return { error: 'Captura el número de guía para marcarlo como enviado.' }
    const movimientos = destino === 'preparando'
      ? pedido.items.filter((it) => esInventariado(datos, it.producto_id)).map((it) => ({
          producto_id: it.producto_id, sucursal_id: pedido.sucursal_id, tipo: 'venta', cantidad: it.cantidad, referencia,
        }))
      : []
    return {
      movimientos,
      cambios: actualizarPedido(pedido.id, { estado: destino, ...(destino === 'enviado' ? { guia_envio: extra.guia.trim() } : {}) }),
      destino,
    }
  }

  if (accion === 'cancelar') {
    if (!puedeCancelarse(pedido)) return { error: 'Un pedido enviado o entregado ya no se puede cancelar.' }
    const regresar = DESCONTADO.includes(pedido.estado)
    const movimientos = regresar
      ? pedido.items.filter((it) => esInventariado(datos, it.producto_id)).map((it) => ({
          producto_id: it.producto_id, sucursal_id: pedido.sucursal_id, tipo: 'cancelacion', cantidad: it.cantidad,
          motivo: 'Pedido cancelado', referencia,
        }))
      : []
    return { movimientos, cambios: actualizarPedido(pedido.id, { estado: 'cancelado' }), regresoExistencias: regresar }
  }

  if (accion === 'marcar_pagado') {
    if (pedido.estado_pago !== 'pendiente' || pedido.estado === 'cancelado') return { error: 'El pedido no tiene un pago pendiente.' }
    return { movimientos: [], cambios: actualizarPedido(pedido.id, { estado_pago: 'pagado' }) }
  }

  if (accion === 'marcar_reembolsado') {
    if (!reembolsoPendiente(pedido)) return { error: 'Este pedido no tiene un reembolso pendiente.' }
    return { movimientos: [], cambios: actualizarPedido(pedido.id, { estado_pago: 'reembolsado' }) }
  }

  if (accion === 'reasignar') {
    if (pedido.estado !== 'nuevo') return { error: 'Solo se puede cambiar la sucursal antes de prepararlo.' }
    const s = datos.sucursales.find((x) => x.id === extra.sucursal_id && x.tipo === 'sucursal' && x.activa)
    if (!s) return { error: 'Elige una sucursal válida.' }
    return { movimientos: [], cambios: actualizarPedido(pedido.id, { sucursal_id: s.id }) }
  }

  return { error: 'Acción desconocida.' }
}

/** Fecha estimada de entrega para productos sobre pedido (fecha del pedido + días del proveedor). */
export function entregaEstimada(datos, pedido) {
  const proveedor = datos.sucursales.find((s) => s.tipo === 'proveedor')
  if (!proveedor?.dias_entrega) return null
  return new Date(new Date(pedido.fecha).getTime() + proveedor.dias_entrega * 86400000).toISOString()
}
