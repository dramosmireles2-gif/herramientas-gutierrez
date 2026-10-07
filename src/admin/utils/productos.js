import { estadoExistencia } from './existencias'

const normalizar = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Filas de inventario de un producto dentro del alcance ('todas' o una sucursal). */
export const filasDe = (inventario, productoId, sucursalId) =>
  inventario.filter((f) => f.producto_id === productoId && (sucursalId === 'todas' || f.sucursal_id === sucursalId))

/**
 * Resumen de existencias de un producto en el alcance elegido:
 * total y estado ('agotado' si no hay nada, 'bajo' si alguna sucursal está bajo su mínimo, 'ok').
 */
export function resumenExistencia(inventario, producto, sucursalId) {
  const filas = filasDe(inventario, producto.id, sucursalId)
  const total = filas.reduce((n, f) => n + f.cantidad, 0)
  if (producto.tipo === 'sobre_pedido') return { total, estado: 'sobre_pedido', filas }
  if (!filas.length) return { total: 0, estado: 'sin_fila', filas }
  const estado = total === 0 ? 'agotado' : filas.some((f) => estadoExistencia(f) !== 'ok') ? 'bajo' : 'ok'
  return { total, estado, filas }
}

export const coincideBusqueda = (producto, texto) => {
  const t = normalizar(texto.trim())
  if (!t) return true
  return t.split(/\s+/).every((palabra) => normalizar(`${producto.nombre} ${producto.sku} ${producto.marca}`).includes(palabra))
}

export const ESTADOS_FILTRO = [
  { valor: '', etiqueta: 'Todos los estados' },
  { valor: 'activo', etiqueta: 'Activos' },
  { valor: 'agotado', etiqueta: 'Agotados' },
  { valor: 'bajo', etiqueta: 'Existencia baja' },
  { valor: 'inactivo', etiqueta: 'Inactivos' },
]
