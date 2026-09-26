// Arma enlaces wa.me. El mensaje del pedido (buildOrderMessage) se agrega en el paso 5.
import { formatPrice } from '../lib/format'

/** Limpia texto antes de mandarlo a WhatsApp: sin caracteres de control ni etiquetas, con largo máximo. */
export const sanitize = (s = '', max = 300) =>
  String(s).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)

export function waUrl(phone, text = '') {
  const digits = String(phone ?? '').replace(/\D/g, '')
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}

export function buildGeneralUrl(branch) {
  if (!branch) return null
  return waUrl(branch.whatsapp, `Hola, les escribo desde la tienda en línea (sucursal ${branch.city}).`)
}

export function buildProductQuestionUrl(product, branch, { outOfStock = false } = {}) {
  if (!branch || !product) return null
  const intro = outOfStock ? 'Hola, avísenme cuando vuelva a haber existencia de:' : 'Hola, tengo una pregunta sobre:'
  const text = `${intro}\n${product.name} (SKU ${product.sku}) - ${formatPrice(product.price)}\nSucursal: ${branch.city}`
  return waUrl(branch.whatsapp, text)
}
