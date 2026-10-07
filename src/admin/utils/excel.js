// Lectura y escritura de Excel con SheetJS. Se carga al usarse (import dinámico) para no pesar en el panel.
import { claveColumna } from './importacion'

const cargarXLSX = () => import('xlsx')
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Descarga un libro de Excel.
 * @param {string} archivo nombre con .xlsx
 * @param {{nombre: string, filas: object[], columnas?: string[], anchos?: number[]}[]} hojas
 */
export async function descargarExcel(archivo, hojas) {
  const XLSX = await cargarXLSX()
  const libro = XLSX.utils.book_new()
  for (const h of hojas) {
    const hoja = XLSX.utils.json_to_sheet(h.filas, { header: h.columnas })
    if (!h.filas.length && h.columnas) XLSX.utils.sheet_add_aoa(hoja, [h.columnas])
    const columnas = h.columnas ?? Object.keys(h.filas[0] ?? {})
    hoja['!cols'] = columnas.map((c, i) => ({ wch: h.anchos?.[i] ?? Math.max(10, c.length + 2) }))
    XLSX.utils.book_append_sheet(libro, hoja, h.nombre)
  }
  XLSX.writeFile(libro, archivo, { compression: true })
}

/**
 * Lee la hoja "Productos" (o la primera) de un .xlsx, .xls o .csv.
 * Devuelve objetos con los encabezados normalizados ("Precio Oferta" → precio_oferta).
 */
export async function leerExcel(archivo) {
  if (archivo.size > MAX_BYTES) throw new Error('El archivo pesa más de 5 MB.')
  if (!/\.(xlsx|xls|csv)$/i.test(archivo.name)) throw new Error('Sube un archivo de Excel (.xlsx o .xls) o CSV.')
  const XLSX = await cargarXLSX()
  let libro
  try {
    libro = XLSX.read(await archivo.arrayBuffer(), { type: 'array' })
  } catch {
    throw new Error('No se pudo leer el archivo. ¿Está dañado o protegido con contraseña?')
  }
  const nombreHoja = libro.SheetNames.find((n) => claveColumna(n) === 'productos') ?? libro.SheetNames[0]
  const crudas = XLSX.utils.sheet_to_json(libro.Sheets[nombreHoja], { defval: '', raw: true })
  // Objetos nuevos con solo claves normalizadas (nada del archivo llega como clave sin limpiar).
  return crudas.map((fila) => {
    const limpia = {}
    for (const [k, v] of Object.entries(fila)) {
      const clave = claveColumna(k)
      if (clave && !(clave in limpia)) limpia[clave] = typeof v === 'string' ? v.trim() : v
    }
    return limpia
  })
}

/** Fecha para nombres de archivo: 2026-10-07 */
export const fechaArchivo = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
