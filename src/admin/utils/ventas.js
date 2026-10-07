// Ventas para el dashboard: pedidos en línea + ventas de mostrador (movimientos tipo "venta" sin pedido).
// En el demo la venta de mostrador se valúa al precio vigente del producto (no hay ticket con importe).
const DIA = 86400000

const diaLocal = (fecha) => {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Lista de ventas { fecha, importe (centavos), canal, sucursal_id } dentro del alcance. */
export function ventas(datos, sucursalId = 'todas') {
  const enAlcance = (id) => sucursalId === 'todas' || id === sucursalId
  const precio = new Map(datos.productos.map((p) => [p.id, p.precio_oferta ?? p.precio]))

  const enLinea = datos.pedidos
    .filter((p) => p.estado !== 'cancelado' && p.estado_pago === 'pagado' && enAlcance(p.sucursal_id))
    .map((p) => ({ fecha: p.fecha, importe: p.total, canal: 'en_linea', sucursal_id: p.sucursal_id }))

  const mostrador = datos.movimientos
    .filter((m) => m.tipo === 'venta' && !m.referencia?.startsWith('Pedido') && enAlcance(m.sucursal_id))
    .map((m) => ({ fecha: m.fecha, importe: Math.abs(m.cantidad) * (precio.get(m.producto_id) ?? 0), canal: 'mostrador', sucursal_id: m.sucursal_id }))

  return [...enLinea, ...mostrador]
}

/** Total del mes calendario en curso, separado por canal. */
export function ventasDelMes(lista, ahora = new Date()) {
  const inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1).getTime()
  const delMes = lista.filter((v) => new Date(v.fecha).getTime() >= inicio)
  const suma = (canal) => delMes.filter((v) => !canal || v.canal === canal).reduce((n, v) => n + v.importe, 0)
  return { total: suma(), enLinea: suma('en_linea'), mostrador: suma('mostrador') }
}

/** Serie diaria de los últimos `dias` días (incluye hoy), con días sin venta en 0. */
export function serieDiaria(lista, dias = 30, ahora = new Date()) {
  const porDia = new Map()
  for (const v of lista) porDia.set(diaLocal(v.fecha), (porDia.get(diaLocal(v.fecha)) ?? 0) + v.importe)
  return Array.from({ length: dias }, (_, i) => {
    const fecha = new Date(ahora.getTime() - (dias - 1 - i) * DIA)
    const clave = diaLocal(fecha)
    return { dia: clave, fecha, total: porDia.get(clave) ?? 0 }
  })
}
