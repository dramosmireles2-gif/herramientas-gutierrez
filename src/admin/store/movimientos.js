// Lógica central de existencias. ÚNICA forma de cambiar inventario.cantidad:
// cada cambio genera un registro en `movimientos` (regla clave de la sección 3 del plan).
// Son funciones puras (estado → nuevo estado) para poder probarlas y, en producción,
// llevar la misma regla a una función de Supabase.

export const TIPOS_MOVIMIENTO = {
  entrada: { etiqueta: 'Entrada', signo: 1 },
  venta: { etiqueta: 'Venta', signo: -1 },
  ajuste: { etiqueta: 'Ajuste', signo: 0 }, // la cantidad trae su propio signo
  traspaso_salida: { etiqueta: 'Traspaso (salida)', signo: -1 },
  traspaso_entrada: { etiqueta: 'Traspaso (entrada)', signo: 1 },
  devolucion: { etiqueta: 'Devolución', signo: 1 },
  cancelacion: { etiqueta: 'Cancelación', signo: 1 },
}

export const MOTIVOS_AJUSTE = ['Conteo físico', 'Merma', 'Daño', 'Error de captura']

export class ErrorMovimiento extends Error {}

/**
 * Aplica varios movimientos de forma atómica: si uno falla, no se aplica ninguno.
 *
 * Cada movimiento: { producto_id, sucursal_id, tipo, cantidad, motivo?, referencia? }
 *  - cantidad > 0. El signo lo pone el tipo (entrada suma, venta resta…).
 *  - En 'ajuste' la cantidad es la diferencia con signo (+2 / −1) y el motivo es obligatorio.
 *
 * @param {object} estado   estado completo del panel (inventario, movimientos, productos, sucursales…)
 * @param {object[]} lista  movimientos a registrar
 * @param {{usuario: object, fecha?: string}} contexto usuario que hace el cambio
 * @returns {{estado: object, movimientos: object[]}}
 * @throws {ErrorMovimiento} con un mensaje listo para mostrar
 */
export function aplicarMovimientos(estado, lista, { usuario, fecha = new Date().toISOString() }) {
  if (!usuario) throw new ErrorMovimiento('No hay un usuario en sesión.')
  const inventario = estado.inventario.map((f) => ({ ...f }))
  const nuevos = []
  let consecutivo = estado.movimientos.length

  for (const m of lista) {
    const tipo = TIPOS_MOVIMIENTO[m.tipo]
    if (!tipo) throw new ErrorMovimiento(`Tipo de movimiento desconocido: ${m.tipo}`)

    const producto = estado.productos.find((p) => p.id === m.producto_id)
    if (!producto) throw new ErrorMovimiento('El producto no existe.')
    const sucursal = estado.sucursales.find((s) => s.id === m.sucursal_id)
    if (!sucursal) throw new ErrorMovimiento('La sucursal no existe.')

    // El encargado solo mueve el inventario de su sucursal.
    if (usuario.rol === 'encargado' && usuario.sucursal_id !== m.sucursal_id) {
      throw new ErrorMovimiento(`Solo puedes mover inventario de tu sucursal.`)
    }

    const cantidad = Number(m.cantidad)
    if (!Number.isInteger(cantidad) || cantidad === 0) throw new ErrorMovimiento('La cantidad debe ser un número entero distinto de cero.')
    if (tipo.signo !== 0 && cantidad < 0) throw new ErrorMovimiento('La cantidad debe ser positiva.')

    const motivo = m.motivo?.trim() || null
    if (m.tipo === 'ajuste' && !motivo) throw new ErrorMovimiento('El ajuste necesita un motivo.')

    const delta = tipo.signo === 0 ? cantidad : tipo.signo * cantidad
    let fila = inventario.find((f) => f.producto_id === m.producto_id && f.sucursal_id === m.sucursal_id)
    if (!fila) {
      fila = { producto_id: m.producto_id, sucursal_id: m.sucursal_id, cantidad: 0, minimo: 0 }
      inventario.push(fila)
    }
    const antes = fila.cantidad
    const despues = antes + delta
    if (despues < 0) {
      throw new ErrorMovimiento(`No hay existencia suficiente de "${producto.nombre}" en ${sucursal.nombre} (hay ${antes}).`)
    }
    fila.cantidad = despues

    nuevos.push({
      id: `m-${String(++consecutivo).padStart(4, '0')}-${Date.now().toString(36)}`,
      fecha,
      producto_id: m.producto_id,
      sucursal_id: m.sucursal_id,
      tipo: m.tipo,
      cantidad: delta,
      existencia_antes: antes,
      existencia_despues: despues,
      motivo,
      referencia: m.referencia?.trim() || null,
      usuario: usuario.nombre,
    })
  }

  return {
    // El historial se guarda del más reciente al más antiguo.
    estado: { ...estado, inventario, movimientos: [...[...nuevos].reverse(), ...estado.movimientos] },
    movimientos: nuevos,
  }
}
