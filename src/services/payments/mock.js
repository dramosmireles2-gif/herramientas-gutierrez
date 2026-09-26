// Pasarela simulada para el demo: no pide ni procesa datos de tarjeta, solo aprueba tras una espera.
// Una pasarela real (mercadopago.js / stripe.js) expone la misma función y redirige a su checkout alojado.
const DELAY_MS = 1800

export async function createCheckout(order) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
  return {
    provider: 'mock',
    status: 'approved',
    payment_id: `MOCK-${order.folio}`,
  }
}
