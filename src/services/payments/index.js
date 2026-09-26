// Adaptador de pagos: la UI solo conoce createCheckout(order).
// Para producción se cambia el proveedor aquí (Mercado Pago Checkout Pro o Stripe Checkout).
import * as mock from './mock'

const provider = mock

/** @returns {Promise<{provider: string, status: 'approved'|'rejected'|'redirect', payment_id?: string, redirect_url?: string}>} */
export function createCheckout(order) {
  return provider.createCheckout(order)
}
