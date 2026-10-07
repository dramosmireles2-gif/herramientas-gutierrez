import { asset } from '../../lib/asset'

// Imágenes de producto: rutas de public/ de la tienda (img/productos/x.webp) o fotos subidas en el demo (data:).
const esAbsoluta = (src) => /^(data:|blob:|https?:)/.test(src)

export const urlImagen = (src) => (!src ? null : esAbsoluta(src) ? src : asset(src))

/** Miniatura de 400 px que genera la tienda (npm run data); las fotos subidas se usan tal cual. */
export const urlMiniatura = (src) =>
  !src ? null : esAbsoluta(src) ? src : asset(src.replace(/([^/]+)$/, '400/$1'))

// Ícono de categoría de la tienda (src/components/icons.jsx → CategoryIcon) para el placeholder sin foto.
const ICONOS = {
  generadores: 'generador',
  hidrolavadoras: 'hidrolavadora',
  compresores: 'compresor',
  podadoras: 'podadora',
  carpinteria: 'carpinteria',
  construccion: 'construccion',
  automotriz: 'automotriz',
}
export const iconoCategoria = (categoriaId) => ICONOS[categoriaId] ?? null

/**
 * Reduce una foto subida a máx. 600 px en WebP para guardarla en localStorage sin llenarlo.
 * Solo demo: en producción las fotos van a Supabase Storage y se comprimen en el servidor.
 */
export function prepararFoto(archivo, maximo = 600) {
  return new Promise((resolve, reject) => {
    if (!archivo.type.startsWith('image/')) return reject(new Error('El archivo no es una imagen.'))
    const lector = new FileReader()
    lector.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    lector.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('No se pudo abrir la imagen.'))
      img.onload = () => {
        const escala = Math.min(1, maximo / Math.max(img.width, img.height))
        const lienzo = document.createElement('canvas')
        lienzo.width = Math.round(img.width * escala)
        lienzo.height = Math.round(img.height * escala)
        const ctx = lienzo.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, lienzo.width, lienzo.height)
        ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height)
        resolve(lienzo.toDataURL('image/webp', 0.8))
      }
      img.src = lector.result
    }
    lector.readAsDataURL(archivo)
  })
}
