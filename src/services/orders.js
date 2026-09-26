// Pedidos. En el demo se guardan en este navegador (localStorage + memoria) y el folio es local.
// En producción: createOrder llama a una Edge Function que recalcula precios y total con la BD,
// y el pedido solo pasa a "pagado" por webhook firmado de la pasarela (nunca desde el navegador).
import { readJSON, writeJSON } from '../lib/storage'
import { onlyDigits, sanitize } from '../lib/sanitize'

const ORDERS_KEY = 'hg-orders'
const SEQ_KEY = 'hg-folio-seq'
const FOLIO_START = 1000
const MAX_STORED = 20

// Envío de ejemplo para el demo (centavos). Política real por confirmar con el cliente.
export const SHIPPING = { flat: 39900, freeFrom: 1000000 }

export function calcShipping(subtotal, delivery) {
  if (delivery !== 'envio') return 0
  return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flat
}

// Respaldo en memoria por si localStorage no está disponible.
const memory = new Map()

const readOrders = () => {
  const list = readJSON(ORDERS_KEY, [])
  return Array.isArray(list) ? list : []
}

function nextFolio() {
  const stored = Number(readJSON(SEQ_KEY, FOLIO_START))
  const seq = Math.max(Number.isFinite(stored) ? stored : FOLIO_START, FOLIO_START, memory.size + FOLIO_START) + 1
  writeJSON(SEQ_KEY, seq)
  return `HG-${String(seq).padStart(6, '0')}`
}

function saveOrder(order) {
  memory.set(order.folio, order)
  const others = readOrders().filter((o) => o.folio !== order.folio)
  writeJSON(ORDERS_KEY, [order, ...others].slice(0, MAX_STORED))
}

/**
 * @param {object} input
 * @param {{product: object, qty: number}[]} input.lines
 * @param {object} input.branch
 * @param {{name: string, phone: string, email?: string}} input.customer
 * @param {'recoger'|'envio'} input.delivery
 * @param {object} [input.address] calle, colonia, ciudad, cp, referencias
 * @param {'web'|'whatsapp'} input.channel
 */
export async function createOrder({ lines, branch, customer, delivery, address, channel }) {
  if (!lines?.length) throw new Error('El carrito está vacío')
  if (!branch) throw new Error('Falta la sucursal')

  const items = lines.map(({ product, qty }) => {
    if (qty > product.stock) throw new Error(`Sin existencia suficiente de ${product.name}`)
    return { product_id: product.id, sku: product.sku, name: product.name, unit_price: product.price, qty }
  })
  const subtotal = items.reduce((n, i) => n + i.unit_price * i.qty, 0)
  const shipping = calcShipping(subtotal, delivery)
  const folio = nextFolio()

  const order = {
    id: globalThis.crypto?.randomUUID?.() ?? folio,
    folio,
    branch_id: branch.id,
    channel,
    status: channel === 'whatsapp' ? 'pendiente_whatsapp' : 'pendiente',
    customer: {
      name: sanitize(customer.name, 80),
      phone: onlyDigits(customer.phone).slice(-10),
      email: sanitize(customer.email, 120) || null,
    },
    delivery,
    address: delivery === 'envio'
      ? {
          calle: sanitize(address?.calle, 120),
          colonia: sanitize(address?.colonia, 80),
          ciudad: sanitize(address?.ciudad, 80),
          cp: onlyDigits(address?.cp).slice(0, 5),
          referencias: sanitize(address?.referencias, 160) || null,
        }
      : null,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    created_at: new Date().toISOString(),
  }
  saveOrder(order)
  return order
}

export async function getOrder(folio) {
  return memory.get(folio) ?? readOrders().find((o) => o.folio === folio) ?? null
}

/** SOLO DEMO. En producción el estado lo cambia el webhook verificado de la pasarela. */
export async function updateOrderStatus(folio, status) {
  const order = await getOrder(folio)
  if (!order) return null
  const updated = { ...order, status }
  saveOrder(updated)
  return updated
}
