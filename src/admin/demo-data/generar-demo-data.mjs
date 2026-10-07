// Genera los JSON de ejemplo del panel (modelo de la sección 3 de PLAN-ADMIN-DEMO.md).
// Uso: node src/admin/demo-data/generar-demo-data.mjs
//
// - Productos inventariados: el catálogo real de la tienda (src/data/products.json), mismos ids e imágenes.
// - 5 productos sobre pedido en "Proveedor Monterrey" (sin foto: el panel muestra placeholder).
// - Movimientos simulados en orden cronológico desde un inventario inicial, así cada
//   existencia_antes → existencia_despues cuadra con el inventario final.
// - Fechas relativas a FECHA_BASE; el store las recorre para que el evento más reciente sea "hace unos minutos".
// - Precios en centavos (igual que la tienda).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = dirname(fileURLToPath(import.meta.url))
const leerTienda = (archivo) => JSON.parse(readFileSync(join(aqui, '../../data', archivo), 'utf8'))
const guardar = (archivo, data) => writeFileSync(join(aqui, archivo), JSON.stringify(data, null, 2) + '\n')

const FECHA_BASE = '2026-10-06T18:00:00.000Z'
const BASE = new Date(FECHA_BASE).getTime()
const DIA = 86400000
const fecha = (diasAtras, hora = 12, min = 0) => {
  const d = new Date(BASE - diasAtras * DIA)
  d.setUTCHours(hora + 6, min, 0, 0) // hora de Monterrey (UTC-6)
  return d.toISOString()
}
const sumarHoras = (iso, horas) => new Date(new Date(iso).getTime() + horas * 3600000).toISOString()

// Números aleatorios con semilla: el resultado es siempre el mismo.
let semilla = 20261006
const rnd = () => {
  semilla |= 0
  semilla = (semilla + 0x6d2b79f5) | 0
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1))
const elegir = (arr) => arr[Math.floor(rnd() * arr.length)]

// ---------- Sucursales ----------
const SUC = ['cdv', 'rey', 'sal', 'tam', 'snn']
const sucursales = [
  { id: 'cdv', nombre: 'Cd. Victoria', estado: 'Tamaulipas' },
  { id: 'rey', nombre: 'Reynosa', estado: 'Tamaulipas' },
  { id: 'sal', nombre: 'Saltillo', estado: 'Coahuila' },
  { id: 'tam', nombre: 'Tampico', estado: 'Tamaulipas' },
  { id: 'snn', nombre: 'San Nicolás de los Garza', estado: 'Nuevo León' },
].map((s) => ({
  ...s,
  tipo: 'sucursal',
  direccion: 'Dirección por confirmar',
  telefono: 'Teléfono por confirmar',
  horario: 'Horario por confirmar',
  permite_recoger: true,
  dias_entrega: null,
  activa: true,
}))
sucursales.push({
  id: 'prov-mty',
  nombre: 'Proveedor Monterrey',
  estado: 'Nuevo León',
  tipo: 'proveedor',
  direccion: 'Bodega del proveedor (por confirmar)',
  telefono: 'Teléfono por confirmar',
  horario: 'Lun a Vie',
  permite_recoger: false,
  dias_entrega: 5,
  activa: true,
})

// ---------- Usuarios (nombres ficticios) ----------
const usuarios = [
  { id: 'u-admin', nombre: 'Sr. Gutiérrez', correo: 'admin@example.com', rol: 'admin', sucursal_id: null },
  { id: 'u-rey', nombre: 'Carlos Treviño', correo: 'reynosa@example.com', rol: 'encargado', sucursal_id: 'rey' },
  { id: 'u-sal', nombre: 'Ana Garza', correo: 'saltillo@example.com', rol: 'encargado', sucursal_id: 'sal' },
  { id: 'u-tam', nombre: 'Miguel Salinas', correo: 'tampico@example.com', rol: 'encargado', sucursal_id: 'tam' },
]
const usuarioDe = (sucursalId) => usuarios.find((u) => u.sucursal_id === sucursalId)?.nombre ?? usuarios[0].nombre

// ---------- Categorías y productos ----------
const categorias = leerTienda('categories.json').map((c) => ({ id: c.id, nombre: c.name, slug: c.slug }))
const marcas = new Map(leerTienda('brands.json').map((b) => [b.id, b.name]))

// Peso (kg) y medidas (cm) de ejemplo por categoría, para cotizar envíos; varían ±15 %.
const MEDIDAS = {
  generadores: [60, 70, 55, 55],
  hidrolavadoras: [30, 90, 50, 45],
  compresores: [35, 80, 40, 75],
  podadoras: [32, 100, 55, 45],
  carpinteria: [28, 65, 55, 45],
  construccion: [80, 90, 55, 90],
  automotriz: [15, 65, 35, 18],
}
const medidas = (categoria, factorPeso = 1) => {
  const [p, l, a, h] = MEDIDAS[categoria] ?? [10, 40, 30, 30]
  const v = () => 0.85 + rnd() * 0.3
  return {
    peso_kg: Math.round(p * factorPeso * v() * 10) / 10,
    largo_cm: Math.round(l * v()),
    ancho_cm: Math.round(a * v()),
    alto_cm: Math.round(h * v()),
  }
}

const productos = leerTienda('products.json').map((p, i) => ({
  id: p.id,
  sku: p.sku,
  nombre: p.name,
  descripcion: p.short_description,
  categoria_id: p.category_id,
  marca: marcas.get(p.brand_id) ?? 'Por confirmar',
  // La tienda guarda el precio vigente y el de "antes"; aquí precio = lista y precio_oferta = vigente.
  precio: p.compare_at_price ?? p.price,
  precio_oferta: p.compare_at_price ? p.price : null,
  ...medidas(p.category_id),
  imagenes: p.images,
  activo: p.active,
  tipo: 'inventariado',
  creado_en: fecha(90 - i),
  actualizado_en: fecha(entre(1, 40)),
}))

const SOBRE_PEDIDO = [
  ['GEN-101', 'Generador diésel trifásico 30 kVA', 'generadores', 'Champion', 28999900, 'Planta de emergencia para negocio o nave industrial. Se surte desde Monterrey.'],
  ['HID-101', 'Hidrolavadora de agua caliente 3,000 PSI', 'hidrolavadoras', 'DeWalt', 8999900, 'Desengrasa maquinaria y pisos de taller con agua caliente.'],
  ['COM-101', 'Compresor de tornillo 10 HP', 'compresores', 'McGraw', 11999900, 'Aire continuo para talleres con varias herramientas neumáticas.'],
  ['POD-101', 'Tractor podador de asiento 42"', 'podadoras', 'Murray', 6499900, 'Corta terrenos grandes sin esfuerzo, con asiento y transmisión automática.'],
  ['CON-101', 'Revolvedora de concreto 1 saco', 'construccion', 'Central Machinery', 3299900, 'Para obra mediana: mezcla un saco de cemento por carga.'],
].map(([sku, nombre, categoria_id, marca, precio, descripcion], i) => ({
  id: `p-s${String(i + 1).padStart(2, '0')}`,
  sku,
  nombre,
  descripcion,
  categoria_id,
  marca,
  precio,
  precio_oferta: null,
  ...medidas(categoria_id, 3),
  imagenes: [],
  activo: true,
  tipo: 'sobre_pedido',
  creado_en: fecha(20 - i),
  actualizado_en: fecha(entre(1, 10)),
}))
productos.push(...SOBRE_PEDIDO)

const inventariados = productos.filter((p) => p.tipo === 'inventariado')
const precioVigente = (p) => p.precio_oferta ?? p.precio
const esSobrePedido = (id) => productos.find((p) => p.id === id).tipo === 'sobre_pedido'

// Casos garantizados para el dashboard y los filtros: [producto, sucursal, existencia final].
// Arrancan con poca existencia para que la venta que los deja así sea pequeña (sin picos en la gráfica).
const ALERTAS = [['p-001', 'rey', 0], ['p-008', 'sal', 0], ['p-028', 'tam', 0], ['p-024', 'cdv', 1], ['p-014', 'rey', 1], ['p-030', 'snn', 1], ['p-006', 'sal', 1]]
const alerta = (productoId, sucursalId) => ALERTAS.find(([p, s]) => p === productoId && s === sucursalId)

// ---------- Inventario inicial (hace ~31 días) ----------
// Una fila por producto y ubicación: inventariados × 5 sucursales; sobre pedido × proveedor.
const inventario = []
for (const p of inventariados) {
  for (const s of SUC) {
    const a = alerta(p.id, s)
    const cantidad = a ? a[2] + entre(1, 2) : entre(0, 4) === 0 ? entre(0, 2) : entre(3, 14)
    inventario.push({ producto_id: p.id, sucursal_id: s, cantidad, minimo: entre(2, 4) })
  }
}
for (const p of SOBRE_PEDIDO) inventario.push({ producto_id: p.id, sucursal_id: 'prov-mty', cantidad: entre(2, 8), minimo: 0 })
const fila = (productoId, sucursalId) => inventario.find((f) => f.producto_id === productoId && f.sucursal_id === sucursalId)

// ---------- Movimientos (misma lógica que registrarMovimiento del store) ----------
const movimientos = []
let consecutivo = 0
function mover({ fecha: f, producto_id, sucursal_id, tipo, cantidad, motivo = null, referencia = null, usuario }) {
  const fi = fila(producto_id, sucursal_id)
  const antes = fi.cantidad
  const despues = antes + cantidad
  if (despues < 0) return false
  fi.cantidad = despues
  movimientos.push({
    id: `m-${String(++consecutivo).padStart(4, '0')}`,
    fecha: f,
    producto_id,
    sucursal_id,
    tipo,
    cantidad,
    existencia_antes: antes,
    existencia_despues: despues,
    motivo,
    referencia,
    usuario: usuario ?? usuarioDe(sucursal_id),
  })
  return true
}

const eventos = [] // { fecha, run(fecha) }: se ejecutan en orden cronológico

// Entradas de mercancía
const proveedores = ['Factura A-1182 · Distribuidora del Norte', 'Factura 55871 · Ferremayoreo MTY', 'Factura F-2093 · Importadora Industrial', 'Remisión 7741 · Proveedor Monterrey']
for (let i = 0; i < 16; i++) {
  const p = elegir(inventariados)
  const s = elegir(SUC)
  const cantidad = entre(3, 10)
  const referencia = elegir(proveedores)
  eventos.push({ fecha: fecha(entre(2, 29), entre(9, 12), entre(0, 59)), run: (f) => mover({ fecha: f, producto_id: p.id, sucursal_id: s, tipo: 'entrada', cantidad, referencia }) })
}
// Ventas de mostrador
for (let i = 0; i < 24; i++) {
  const p = elegir(inventariados)
  const s = elegir(SUC)
  const cantidad = -entre(1, 2)
  const referencia = `Ticket ${entre(10000, 99999)} · mostrador`
  eventos.push({ fecha: fecha(entre(0, 29), entre(10, 18), entre(0, 59)), run: (f) => mover({ fecha: f, producto_id: p.id, sucursal_id: s, tipo: 'venta', cantidad, referencia }) })
}
// Ajustes con motivo obligatorio
const MOTIVOS = ['Conteo físico', 'Merma', 'Daño en almacén', 'Error de captura']
for (let i = 0; i < 8; i++) {
  const p = elegir(inventariados)
  const s = elegir(SUC)
  const motivo = MOTIVOS[i % MOTIVOS.length]
  const cantidad = motivo === 'Merma' || motivo === 'Daño en almacén' ? -1 : elegir([-1, 1, 2])
  const referencia = motivo === 'Conteo físico' ? 'Inventario cíclico' : null
  eventos.push({ fecha: fecha(entre(1, 28), entre(17, 19), entre(0, 59)), run: (f) => mover({ fecha: f, producto_id: p.id, sucursal_id: s, tipo: 'ajuste', cantidad, motivo, referencia }) })
}
// Devolución de un cliente
{
  const p = elegir(inventariados)
  eventos.push({ fecha: fecha(6, 13, 20), run: (f) => mover({ fecha: f, producto_id: p.id, sucursal_id: 'snn', tipo: 'devolucion', cantidad: 1, motivo: 'Cliente cambió de modelo', referencia: 'Ticket 48213' }) })
}

// ---------- Traspasos (3 recibidos, 1 en tránsito) ----------
const traspasos = []
const PLAN_TRASPASOS = [
  { origen: 'sal', destino: 'tam', envio: 22, recibe: 20 },
  { origen: 'snn', destino: 'rey', envio: 15, recibe: 14 },
  { origen: 'cdv', destino: 'sal', envio: 9, recibe: 8 },
  { origen: 'rey', destino: 'cdv', envio: 1, recibe: null },
]
PLAN_TRASPASOS.forEach((t, i) => {
  const folio = `TR-${String(i + 1).padStart(4, '0')}`
  const traspaso = {
    id: `t-${i + 1}`,
    folio,
    origen_id: t.origen,
    destino_id: t.destino,
    estado: t.recibe == null ? 'enviado' : 'recibido',
    items: [],
    fecha_envio: fecha(t.envio, 10, 15),
    fecha_recepcion: t.recibe == null ? null : fecha(t.recibe, 16, 40),
    usuario: usuarioDe(t.origen),
  }
  traspasos.push(traspaso)
  eventos.push({
    fecha: traspaso.fecha_envio,
    run: (f) => {
      const candidatos = inventariados.filter((p) => fila(p.id, t.origen).cantidad >= 4)
      for (let k = 0; k < 2 && candidatos.length; k++) {
        const p = candidatos.splice(Math.floor(rnd() * candidatos.length), 1)[0]
        const cantidad = entre(1, 3)
        const ok = mover({ fecha: f, producto_id: p.id, sucursal_id: t.origen, tipo: 'traspaso_salida', cantidad: -cantidad, referencia: folio, usuario: traspaso.usuario })
        if (ok) traspaso.items.push({ producto_id: p.id, cantidad })
      }
    },
  })
  if (traspaso.fecha_recepcion) {
    eventos.push({
      fecha: traspaso.fecha_recepcion,
      run: (f) => traspaso.items.forEach((it) => mover({ fecha: f, producto_id: it.producto_id, sucursal_id: t.destino, tipo: 'traspaso_entrada', cantidad: it.cantidad, referencia: folio })),
    })
  }
})

// ---------- Pedidos (15, envío y recoger, distintos estados) ----------
const CLIENTES = [
  ['Jorge Villarreal', '8112345678'], ['María Elena Cantú', '8341122334'], ['Roberto Garza', '8999876543'],
  ['Luisa Hernández', '8445566778'], ['Constructora Del Bravo', '8999001122'], ['Pedro Martínez', '8331234567'],
  ['Taller Hermanos Leal', '8187654321'], ['Sofía Ramírez', '8442233445'], ['Daniel Ortiz', '8341987654'],
  ['Jardines del Valle', '8119988776'], ['Andrés Medina', '8336655443'], ['Paola Elizondo', '8998877665'],
  ['Héctor Saldaña', '8443322110'], ['Ferretería La Esquina', '8183344556'], ['Verónica Treviño', '8335544332'],
]
// [estado final, método, días atrás]
const PLAN_PEDIDOS = [
  ['nuevo', 'recoger', 0], ['nuevo', 'envio', 0], ['nuevo', 'recoger', 1],
  ['preparando', 'envio', 1], ['preparando', 'recoger', 2],
  ['listo_para_recoger', 'recoger', 2], ['listo_para_recoger', 'recoger', 3],
  ['enviado', 'envio', 3], ['enviado', 'envio', 5],
  ['entregado', 'recoger', 8], ['entregado', 'envio', 12], ['entregado', 'recoger', 17], ['entregado', 'envio', 24],
  ['cancelado', 'recoger', 10], ['cancelado', 'envio', 4],
]
const COLONIAS = ['Col. Del Valle', 'Col. Centro', 'Col. Las Fuentes', 'Col. Mitras', 'Col. Jardines']
const nombreSucursal = (id) => sucursales.find((s) => s.id === id).nombre

const pedidos = PLAN_PEDIDOS.map(([estado, metodo, dias], i) => {
  const [nombre, telefono] = CLIENTES[i]
  const sucursal_id = elegir(SUC)
  const items = []
  const cuantos = entre(1, 2)
  for (let k = 0; k < cuantos; k++) {
    const p = elegir(inventariados)
    if (!items.some((it) => it.producto_id === p.id)) items.push({ producto_id: p.id, cantidad: 1, precio: precioVigente(p) })
  }
  // Dos pedidos llevan un producto sobre pedido (se surte del proveedor). Se fijan el tractor y la
  // revolvedora: el generador de 30 kVA haría un pico en la gráfica que aplana el resto de los días.
  const sobrePedido = { 1: 'POD-101', 8: 'CON-101' }[i]
  if (sobrePedido) {
    const p = SOBRE_PEDIDO.find((x) => x.sku === sobrePedido)
    items.push({ producto_id: p.id, cantidad: 1, precio: p.precio })
  }
  const subtotal = items.reduce((n, it) => n + it.precio * it.cantidad, 0)
  const envio = metodo === 'envio' ? (subtotal >= 1000000 ? 0 : 39900) : 0
  return {
    id: `o-${i + 1}`,
    folio: `HG-${String(900 + i + 1).padStart(6, '0')}`,
    fecha: fecha(dias, entre(9, 20), entre(0, 59)),
    cliente: { nombre, telefono, correo: i % 3 === 0 ? null : `${nombre.split(' ')[0].toLowerCase()}@example.com` },
    metodo,
    sucursal_id,
    direccion_envio: metodo === 'envio' ? `Calle ${entre(1, 40)} #${entre(100, 999)}, ${elegir(COLONIAS)}, ${nombreSucursal(sucursal_id)}` : null,
    subtotal,
    envio,
    total: subtotal + envio,
    estado_pago: estado === 'cancelado' ? 'reembolsado' : estado === 'nuevo' && i === 2 ? 'pendiente' : 'pagado',
    estado,
    guia_envio: metodo === 'envio' && ['enviado', 'entregado'].includes(estado) ? `GUIA-${entre(100000, 999999)}` : null,
    items,
  }
})

// Al pasar a "preparando" se descuenta de la sucursal asignada (venta).
// El pedido 14 se canceló antes de prepararse; el 15 después (su cancelación regresa existencias).
pedidos.forEach((p, i) => {
  if (p.estado === 'nuevo' || (p.estado === 'cancelado' && i === 13)) return
  eventos.push({
    fecha: sumarHoras(p.fecha, 2),
    run: (f) => p.items.forEach((it) => {
      if (esSobrePedido(it.producto_id)) return
      const venta = { fecha: f, producto_id: it.producto_id, sucursal_id: p.sucursal_id, tipo: 'venta', cantidad: -it.cantidad, referencia: `Pedido ${p.folio}` }
      if (!mover(venta)) {
        // Sin existencia en la simulación: entra mercancía antes para que el pedido sea coherente.
        mover({ fecha: f, producto_id: it.producto_id, sucursal_id: p.sucursal_id, tipo: 'entrada', cantidad: 3, referencia: 'Resurtido urgente' })
        mover(venta)
      }
    }),
  })
  if (p.estado === 'cancelado') {
    eventos.push({
      fecha: sumarHoras(p.fecha, 26),
      run: (f) => p.items.forEach((it) => {
        if (esSobrePedido(it.producto_id)) return
        mover({ fecha: f, producto_id: it.producto_id, sucursal_id: p.sucursal_id, tipo: 'cancelacion', cantidad: it.cantidad, motivo: 'Cliente canceló el pedido', referencia: `Pedido ${p.folio}`, usuario: usuarios[0].nombre })
      }),
    })
  }
})

// ---------- Ejecutar en orden cronológico ----------
eventos.sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach((e) => e.run(e.fecha))

// Deja los casos de ALERTAS en su existencia final con una venta de mostrador en la última semana,
// siempre después del último movimiento de ese producto en esa sucursal (la cadena sigue cuadrando).
for (const [productoId, sucursalId, objetivo] of ALERTAS) {
  const fi = fila(productoId, sucursalId)
  if (fi.cantidad <= objetivo) continue
  const ultimo = movimientos.filter((m) => m.producto_id === productoId && m.sucursal_id === sucursalId).map((m) => m.fecha).sort().at(-1)
  const candidata = fecha(entre(0, 6), entre(10, 17), entre(0, 59))
  const f = ultimo && candidata <= ultimo ? sumarHoras(ultimo, 2) : candidata
  mover({ fecha: f, producto_id: productoId, sucursal_id: sucursalId, tipo: 'venta', cantidad: objetivo - fi.cantidad, referencia: `Ticket ${entre(10000, 99999)} · mostrador` })
}

// Más reciente primero; con la misma fecha manda el consecutivo (orden real en que ocurrieron).
movimientos.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))

// ---------- Configuración (datos de la tienda, envíos y pago) ----------
// No es una tabla del modelo de la sección 3: en Supabase sería una tabla de una sola fila.
// Montos en centavos. Tarifas por zona y rango de peso (opción si la paquetería no tiene API).
const configuracion = {
  tienda: {
    nombre: 'Herramientas Gutiérrez',
    telefono: 'Por confirmar',
    correo: 'Por confirmar',
    sitio: 'https://dramosmireles2-gif.github.io/herramientas-gutierrez/',
  },
  envios: {
    gratis_desde: 1000000, // igual que la tienda: envío gratis desde $10,000
    zonas: [
      { id: 'local', nombre: 'Local', descripcion: 'Misma ciudad de la sucursal' },
      { id: 'regional', nombre: 'Regional', descripcion: 'Tamaulipas, Nuevo León y Coahuila' },
      { id: 'nacional', nombre: 'Nacional', descripcion: 'Resto del país' },
    ],
    rangos: [{ hasta_kg: 5 }, { hasta_kg: 20 }, { hasta_kg: 50 }, { hasta_kg: 100 }],
    tarifas: {
      local: [9900, 14900, 24900, 39900],
      regional: [14900, 24900, 44900, 69900],
      nacional: [24900, 39900, 69900, 119900],
    },
  },
  pagos: { proveedor: 'Openpay', estado: 'pendiente' },
}

// ---------- Guardar ----------
const tablas = { sucursales, categorias, productos, inventario, movimientos, traspasos, pedidos, usuarios, configuracion }
for (const [nombre, data] of Object.entries(tablas)) guardar(`${nombre}.json`, data)

const contar = (arr, campo) =>
  Object.entries(arr.reduce((m, x) => ((m[x[campo]] = (m[x[campo]] ?? 0) + 1), m), {})).map(([k, v]) => `${k}:${v}`).join(' ')
const enSucursal = inventario.filter((f) => f.sucursal_id !== 'prov-mty')
console.log(`productos ${productos.length} (${SOBRE_PEDIDO.length} sobre pedido) · inventario ${inventario.length} filas · usuarios ${usuarios.length}`)
console.log(`movimientos ${movimientos.length} → ${contar(movimientos, 'tipo')}`)
console.log(`traspasos ${traspasos.length} → ${contar(traspasos, 'estado')} · pedidos ${pedidos.length} → ${contar(pedidos, 'estado')}`)
console.log(`agotados ${enSucursal.filter((f) => f.cantidad === 0).length} · bajo mínimo ${enSucursal.filter((f) => f.cantidad > 0 && f.cantidad < f.minimo).length}`)
