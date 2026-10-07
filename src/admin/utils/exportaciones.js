// Libros de Excel que genera el panel: plantilla, archivo de prueba, productos y movimientos.
import { TIPOS_MOVIMIENTO } from '../store/movimientos'
import { descargarExcel, fechaArchivo } from './excel'
import { columnasPlantilla, filaDeProducto } from './importacion'

const ANCHOS = { sku: 12, nombre: 40, descripcion: 40, categoria: 16, marca: 16, precio: 10, precio_oferta: 13, tipo: 14 }
const anchosDe = (columnas) => columnas.map((c) => ANCHOS[c] ?? 11)

function hojaInstrucciones(columnas) {
  return {
    nombre: 'Instrucciones',
    columnas: ['columna', 'qué poner'],
    anchos: [16, 90],
    filas: [
      { columna: 'CÓMO FUNCIONA', 'qué poner': 'Llena la hoja "Productos": una fila por producto. Si el SKU ya existe, la fila actualiza ese producto; si no, lo crea.' },
      { columna: '', 'qué poner': 'Para actualizar solo algunos datos (ej. precios), deja vacías las demás columnas: lo vacío no cambia.' },
      { columna: '', 'qué poner': 'Las existencias que cambien quedan registradas como "ajuste" en Movimientos, con el nombre del archivo.' },
      { columna: '', 'qué poner': '' },
      ...columnas.map((c) => ({ columna: c.clave, 'qué poner': c.ayuda })),
    ],
  }
}

/** Plantilla vacía con una fila de ejemplo y la hoja de instrucciones. */
export function descargarPlantilla(datos) {
  const columnas = columnasPlantilla(datos.sucursales)
  const claves = columnas.map((c) => c.clave)
  const ejemplo = {
    sku: 'EJEMPLO-001', nombre: 'Rotomartillo 1/2" 850 W', descripcion: 'Borra esta fila de ejemplo antes de importar.',
    categoria: 'Construcción', marca: 'DeWalt', precio: 1899, precio_oferta: '', peso_kg: 3.2, largo_cm: 40, ancho_cm: 12, alto_cm: 28, tipo: 'inventariado',
  }
  claves.filter((c) => c.startsWith('exist_')).forEach((c) => { ejemplo[c] = 0 })
  return descargarExcel('plantilla-productos-herramientas-gutierrez.xlsx', [
    { nombre: 'Productos', columnas: claves, anchos: anchosDe(claves), filas: [ejemplo] },
    hojaInstrucciones(columnas),
  ])
}

/**
 * Archivo para la demostración: mezcla filas que actualizan, filas nuevas y filas con errores
 * típicos, para enseñar la validación (paso 8 del recorrido).
 */
export function descargarArchivoDePrueba(datos) {
  const claves = columnasPlantilla(datos.sucursales).map((c) => c.clave)
  const porSku = (sku) => datos.productos.find((p) => p.sku === sku)
  const actualizar = (sku, cambios) => {
    const p = porSku(sku)
    if (!p) return null
    const fila = Object.fromEntries(claves.map((c) => [c, '']))
    return { ...fila, sku: p.sku, nombre: p.nombre, ...cambios }
  }
  const nuevo = (base) => ({ ...Object.fromEntries(claves.map((c) => [c, ''])), tipo: 'inventariado', ...base })
  const filas = [
    // Actualizan: precio y existencias de productos existentes
    actualizar('GEN-009', { precio: 11499, exist_rey: 15, exist_sal: 8 }),
    actualizar('HID-004', { precio_oferta: 2999 }),
    actualizar('COM-002', { exist_cdv: 6, exist_tam: 4 }),
    // Nuevos
    nuevo({ sku: 'CON-201', nombre: 'Cortadora de concreto 14" a gasolina', categoria: 'Construcción', marca: 'Central Machinery', precio: 15999, peso_kg: 38, largo_cm: 95, ancho_cm: 50, alto_cm: 60, exist_snn: 3, exist_rey: 2 }),
    nuevo({ sku: 'AUT-201', nombre: 'Cargador de baterías 12 V con arrancador', categoria: 'automotriz', marca: 'Pittsburgh', precio: 2499, precio_oferta: 2199, peso_kg: 6.5, largo_cm: 35, ancho_cm: 25, alto_cm: 30, exist_cdv: 5 }),
    // Con errores
    nuevo({ sku: 'GEN-201', nombre: 'Generador inverter 2,200 W', categoria: 'Generadores', marca: 'Predator', precio: '', peso_kg: 21, largo_cm: 52, ancho_cm: 30, alto_cm: 45 }),
    nuevo({ sku: 'CON-201', nombre: 'Cortadora duplicada', categoria: 'Construcción', marca: 'Central Machinery', precio: 15999, peso_kg: 38, largo_cm: 95, ancho_cm: 50, alto_cm: 60 }),
    nuevo({ sku: 'POD-201', nombre: 'Desbrozadora 52 cc', categoria: 'Jardinería', marca: 'Echo', precio: 4599, peso_kg: 9, largo_cm: 160, ancho_cm: 30, alto_cm: 30 }),
    actualizar('HID-002', { precio: 9999, precio_oferta: 10999 }),
    actualizar('CAR-003', { exist_sal: -2 }),
  ].filter(Boolean)
  return descargarExcel('prueba-importacion-demo.xlsx', [
    { nombre: 'Productos', columnas: claves, anchos: anchosDe(claves), filas },
    hojaInstrucciones(columnasPlantilla(datos.sucursales)),
  ])
}

/** Productos con existencias por sucursal. Mismas columnas que la plantilla: se puede editar y volver a subir. */
export function exportarProductos(datos) {
  const claves = columnasPlantilla(datos.sucursales).map((c) => c.clave)
  const filas = [...datos.productos].sort((a, b) => a.sku.localeCompare(b.sku)).map((p) => filaDeProducto(p, datos))
  return descargarExcel(`productos-herramientas-gutierrez-${fechaArchivo()}.xlsx`, [
    { nombre: 'Productos', columnas: claves, anchos: anchosDe(claves), filas },
  ])
}

const fechaHora = new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

/** Movimientos (ya filtrados en pantalla). */
export function exportarMovimientos(datos, movimientos) {
  const producto = (id) => datos.productos.find((p) => p.id === id)
  const sucursal = (id) => datos.sucursales.find((s) => s.id === id)?.nombre ?? id
  const columnas = ['fecha', 'sku', 'producto', 'sucursal', 'tipo', 'cantidad', 'existencia_antes', 'existencia_despues', 'motivo', 'referencia', 'usuario']
  const filas = movimientos.map((m) => ({
    fecha: fechaHora.format(new Date(m.fecha)),
    sku: producto(m.producto_id)?.sku ?? '',
    producto: producto(m.producto_id)?.nombre ?? m.producto_id,
    sucursal: sucursal(m.sucursal_id),
    tipo: TIPOS_MOVIMIENTO[m.tipo]?.etiqueta ?? m.tipo,
    cantidad: m.cantidad,
    existencia_antes: m.existencia_antes,
    existencia_despues: m.existencia_despues,
    motivo: m.motivo ?? '',
    referencia: m.referencia ?? '',
    usuario: m.usuario,
  }))
  return descargarExcel(`movimientos-herramientas-gutierrez-${fechaArchivo()}.xlsx`, [
    { nombre: 'Movimientos', columnas, anchos: [18, 12, 40, 18, 18, 10, 16, 18, 22, 34, 18], filas },
  ])
}
