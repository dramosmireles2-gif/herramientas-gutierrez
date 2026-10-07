// Plantilla de Excel e importación de productos (sección 4.8). Funciones puras, sin SheetJS:
// la lectura y escritura del archivo está en utils/excel.js.

const normalizar = (s = '') => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()
/** Encabezado → clave: "Precio Oferta" → "precio_oferta". */
export const claveColumna = (encabezado) => normalizar(encabezado).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

export const MAX_FILAS = 2000

/** Columnas de la plantilla (orden del archivo). Las de existencia salen de las sucursales. */
export function columnasPlantilla(sucursales) {
  return [
    { clave: 'sku', ayuda: 'Obligatorio. Identifica el producto: si ya existe, la fila lo actualiza.' },
    { clave: 'nombre', ayuda: 'Obligatorio en productos nuevos.' },
    { clave: 'descripcion', ayuda: 'Opcional. Texto corto para la ficha.' },
    { clave: 'categoria', ayuda: 'Nombre de la categoría (ej. Generadores). Obligatoria en nuevos.' },
    { clave: 'marca', ayuda: 'Obligatoria en nuevos.' },
    { clave: 'precio', ayuda: 'Precio de lista en pesos (ej. 12499). Obligatorio en nuevos.' },
    { clave: 'precio_oferta', ayuda: 'Opcional. Debe ser menor que el precio.' },
    { clave: 'peso_kg', ayuda: 'Para cotizar envíos. Obligatorio en nuevos.' },
    { clave: 'largo_cm', ayuda: 'Obligatorio en nuevos.' },
    { clave: 'ancho_cm', ayuda: 'Obligatorio en nuevos.' },
    { clave: 'alto_cm', ayuda: 'Obligatorio en nuevos.' },
    { clave: 'tipo', ayuda: '"inventariado" (por defecto) o "sobre_pedido". No se cambia en productos existentes.' },
    ...sucursales
      .filter((s) => s.tipo === 'sucursal')
      .map((s) => ({ clave: `exist_${s.id}`, ayuda: `Existencia en ${s.nombre}. Vacío = no cambia. Si cambia, se registra un ajuste.` })),
  ]
}

/** Fila de Excel (precios en pesos) desde un producto, con sus existencias. Se usa en plantilla y exportación. */
export function filaDeProducto(producto, datos) {
  const categoria = datos.categorias.find((c) => c.id === producto.categoria_id)
  const fila = {
    sku: producto.sku,
    nombre: producto.nombre,
    descripcion: producto.descripcion ?? '',
    categoria: categoria?.nombre ?? producto.categoria_id,
    marca: producto.marca,
    precio: producto.precio / 100,
    precio_oferta: producto.precio_oferta == null ? '' : producto.precio_oferta / 100,
    peso_kg: producto.peso_kg,
    largo_cm: producto.largo_cm,
    ancho_cm: producto.ancho_cm,
    alto_cm: producto.alto_cm,
    tipo: producto.tipo,
  }
  for (const s of datos.sucursales.filter((x) => x.tipo === 'sucursal')) {
    const f = datos.inventario.find((x) => x.producto_id === producto.id && x.sucursal_id === s.id)
    fila[`exist_${s.id}`] = producto.tipo === 'inventariado' ? f?.cantidad ?? 0 : ''
  }
  return fila
}

const vacio = (v) => v == null || String(v).trim() === ''
const numero = (v) => {
  if (typeof v === 'number') return v
  const limpio = String(v).replace(/[$,\s]/g, '')
  return limpio === '' ? NaN : Number(limpio)
}

/**
 * Valida las filas leídas del Excel contra el catálogo actual.
 * @param {object[]} filas objetos con claves normalizadas (ver claveColumna)
 * @returns {{ errorGeneral?: string, resultados: Array<{fila, sku, nombre, accion: 'nuevo'|'actualizar', errores: string[], cambios: object, existencias: object, producto?: object}> }}
 */
export function validarImportacion(filas, datos) {
  const columnas = new Set(filas.flatMap((f) => Object.keys(f)))
  if (!columnas.has('sku')) return { errorGeneral: 'El archivo no tiene la columna "sku". Descarga la plantilla y usa sus columnas.', resultados: [] }
  if (filas.length > MAX_FILAS) return { errorGeneral: `El archivo tiene ${filas.length} filas; el máximo es ${MAX_FILAS}.`, resultados: [] }

  const sucursales = datos.sucursales.filter((s) => s.tipo === 'sucursal')
  const categoriaDe = (v) => datos.categorias.find((c) => [c.id, c.slug, normalizar(c.nombre)].includes(normalizar(v)))
  const vistos = new Map() // sku → fila donde apareció
  const resultados = []

  filas.forEach((f, i) => {
    const filaExcel = i + 2 // la fila 1 es el encabezado
    if (Object.values(f).every(vacio)) return // fila en blanco

    const errores = []
    const sku = String(f.sku ?? '').trim().toUpperCase()
    const existente = sku ? datos.productos.find((p) => p.sku.toUpperCase() === sku) : null
    const nuevo = !existente
    const cambios = {}

    if (!sku) errores.push('Falta el SKU.')
    else if (vistos.has(sku)) errores.push(`SKU repetido en el archivo (también en la fila ${vistos.get(sku)}).`)
    else vistos.set(sku, filaExcel)

    // Texto
    for (const [clave, etiqueta, max] of [['nombre', 'el nombre', 120], ['marca', 'la marca', 40], ['descripcion', null, 300]]) {
      if (!vacio(f[clave])) cambios[clave] = String(f[clave]).trim().slice(0, max)
      else if (nuevo && etiqueta) errores.push(`Falta ${etiqueta}.`)
    }

    // Categoría
    if (!vacio(f.categoria)) {
      const c = categoriaDe(f.categoria)
      c ? (cambios.categoria_id = c.id) : errores.push(`Categoría "${f.categoria}" no existe.`)
    } else if (nuevo) errores.push('Falta la categoría.')

    // Tipo
    let tipo = existente?.tipo ?? 'inventariado'
    if (!vacio(f.tipo)) {
      const t = normalizar(f.tipo).replace(/\s+/g, '_')
      if (!['inventariado', 'sobre_pedido'].includes(t)) errores.push(`Tipo "${f.tipo}" no válido (usa inventariado o sobre_pedido).`)
      else if (existente && t !== existente.tipo) errores.push('El tipo no se puede cambiar en un producto existente.')
      else tipo = t
    }
    if (nuevo) cambios.tipo = tipo

    // Precios (pesos → centavos)
    let precio = existente?.precio ?? null
    if (!vacio(f.precio)) {
      const n = numero(f.precio)
      if (!(n > 0)) errores.push('El precio debe ser un número mayor que cero.')
      else precio = cambios.precio = Math.round(n * 100)
    } else if (nuevo) errores.push('Falta el precio.')
    if (!vacio(f.precio_oferta)) {
      const n = numero(f.precio_oferta)
      if (!(n > 0)) errores.push('El precio de oferta debe ser un número mayor que cero.')
      else if (precio != null && Math.round(n * 100) >= precio) errores.push('El precio de oferta debe ser menor que el precio.')
      else cambios.precio_oferta = Math.round(n * 100)
    }

    // Peso y medidas
    for (const clave of ['peso_kg', 'largo_cm', 'ancho_cm', 'alto_cm']) {
      if (!vacio(f[clave])) {
        const n = numero(f[clave])
        n > 0 ? (cambios[clave] = n) : errores.push(`${clave} debe ser un número mayor que cero.`)
      } else if (nuevo) errores.push(`Falta ${clave} (se usa para cotizar envíos).`)
    }

    // Existencias por sucursal: vacío = no cambia
    const existencias = {}
    for (const s of sucursales) {
      const v = f[`exist_${s.id}`]
      if (vacio(v)) continue
      if (tipo === 'sobre_pedido') { errores.push('Producto sobre pedido: deja vacías las existencias.'); break }
      const n = numero(v)
      if (!Number.isInteger(n) || n < 0) errores.push(`exist_${s.id} debe ser un número entero de 0 o más.`)
      else existencias[s.id] = n
    }

    resultados.push({
      fila: filaExcel,
      sku,
      nombre: cambios.nombre ?? existente?.nombre ?? '',
      accion: nuevo ? 'nuevo' : 'actualizar',
      errores,
      cambios,
      existencias,
      producto: existente ?? null,
    })
  })

  if (!resultados.length) return { errorGeneral: 'El archivo no tiene filas con datos.', resultados: [] }
  return { resultados }
}

/** Diferencias de existencia que generará la importación (para la vista previa y los ajustes). */
export function diferenciasExistencia(resultado, inventario) {
  return Object.entries(resultado.existencias)
    .map(([sucursal_id, n]) => {
      // Un producto nuevo arranca en 0 en todas sus sucursales.
      const antes = resultado.producto
        ? inventario.find((f) => f.producto_id === resultado.producto.id && f.sucursal_id === sucursal_id)?.cantidad ?? 0
        : 0
      return { sucursal_id, antes, despues: n }
    })
    .filter((d) => d.antes !== d.despues)
}
