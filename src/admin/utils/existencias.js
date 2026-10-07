// Cálculos de existencias sobre la tabla `inventario` (una fila por producto y sucursal).

export const filaInventario = (inventario, productoId, sucursalId) =>
  inventario.find((f) => f.producto_id === productoId && f.sucursal_id === sucursalId) ?? null

/** Existencia de un producto en una sucursal, o la suma de todas si sucursalId es 'todas'/null. */
export function existencia(inventario, productoId, sucursalId = null) {
  return inventario
    .filter((f) => f.producto_id === productoId && (!sucursalId || sucursalId === 'todas' || f.sucursal_id === sucursalId))
    .reduce((n, f) => n + f.cantidad, 0)
}

/** 'agotado' | 'bajo' | 'ok' para una fila de inventario. */
export function estadoExistencia({ cantidad, minimo }) {
  if (cantidad <= 0) return 'agotado'
  if (cantidad < minimo) return 'bajo'
  return 'ok'
}

/** Valor del inventario a precio vigente (centavos). */
export function valorInventario(inventario, productos, sucursalId = null) {
  const precio = new Map(productos.map((p) => [p.id, p.precio_oferta ?? p.precio]))
  return inventario
    .filter((f) => !sucursalId || sucursalId === 'todas' || f.sucursal_id === sucursalId)
    .reduce((n, f) => n + f.cantidad * (precio.get(f.producto_id) ?? 0), 0)
}
