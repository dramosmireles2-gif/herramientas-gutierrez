// Arma enlaces wa.me con mensajes listos. Todo texto del usuario pasa por sanitize.
import { formatPrice } from '../lib/format'
import { sanitize } from '../lib/sanitize'

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

/** Mensaje del pedido con el formato acordado en CLAUDE.md. */
export function buildOrderMessage(order, branch) {
  if (!order || !branch) return null
  const { customer, address } = order
  const lines = [
    `Hola, quiero hacer este pedido (Folio ${order.folio}):`,
    ...order.items.map((i) => `• ${i.qty} x ${sanitize(i.name, 120)} (SKU ${i.sku}) - ${formatPrice(i.unit_price * i.qty)}`),
  ]
  if (order.shipping > 0) lines.push(`Envío: ${formatPrice(order.shipping)}`)
  lines.push(`Total: ${formatPrice(order.total)} MXN`)
  lines.push(`Sucursal: ${branch.city} · ${order.delivery === 'envio' ? 'Envío a domicilio' : 'Recoger en tienda'}`)
  if (order.delivery === 'envio' && address) {
    const parts = [address.calle, address.colonia, address.ciudad, address.cp && `CP ${address.cp}`].filter(Boolean)
    lines.push(`Dirección: ${sanitize(parts.join(', '), 250)}`)
    if (address.referencias) lines.push(`Referencias: ${sanitize(address.referencias, 160)}`)
  }
  lines.push(`Nombre: ${sanitize(customer.name, 80)}`)
  lines.push(`Teléfono: ${customer.phone}`)
  if (customer.email) lines.push(`Correo: ${sanitize(customer.email, 120)}`)
  return waUrl(branch.whatsapp, lines.join('\n'))
}
