// Datos de ejemplo del demo (src/admin/demo-data/*.json, mismo modelo que el futuro Supabase).
// Las fechas se recorren para que el evento más reciente quede unos minutos antes de "ahora":
// así "últimos 30 días" siempre se ve actual y nada aparece en el futuro.
import sucursales from '../demo-data/sucursales.json'
import categorias from '../demo-data/categorias.json'
import productos from '../demo-data/productos.json'
import inventario from '../demo-data/inventario.json'
import movimientos from '../demo-data/movimientos.json'
import traspasos from '../demo-data/traspasos.json'
import pedidos from '../demo-data/pedidos.json'
import usuarios from '../demo-data/usuarios.json'
import configuracion from '../demo-data/configuracion.json'

const recorrer = (iso, delta) => (iso ? new Date(new Date(iso).getTime() + delta).toISOString() : iso)
const MARGEN_MS = 5 * 60 * 1000

// Fecha del evento más reciente en los datos de ejemplo (movimientos, pedidos y traspasos).
const masReciente = Math.max(
  ...movimientos.map((m) => Date.parse(m.fecha)),
  ...pedidos.map((p) => Date.parse(p.fecha)),
  ...traspasos.flatMap((t) => [t.fecha_envio, t.fecha_recepcion].filter(Boolean).map(Date.parse)),
)

/** Copia nueva de los datos originales, con las fechas recorridas a `ahora`. */
export function datosIniciales(ahora = new Date()) {
  const delta = ahora.getTime() - MARGEN_MS - masReciente
  const clon = (x) => structuredClone(x)
  return {
    sucursales: clon(sucursales),
    categorias: clon(categorias),
    productos: clon(productos).map((p) => ({ ...p, creado_en: recorrer(p.creado_en, delta), actualizado_en: recorrer(p.actualizado_en, delta) })),
    inventario: clon(inventario),
    movimientos: clon(movimientos).map((m) => ({ ...m, fecha: recorrer(m.fecha, delta) })),
    traspasos: clon(traspasos).map((t) => ({ ...t, fecha_envio: recorrer(t.fecha_envio, delta), fecha_recepcion: recorrer(t.fecha_recepcion, delta) })),
    pedidos: clon(pedidos).map((p) => ({ ...p, fecha: recorrer(p.fecha, delta) })),
    usuarios: clon(usuarios),
    configuracion: clon(configuracion),
  }
}
