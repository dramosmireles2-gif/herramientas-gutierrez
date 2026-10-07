// Formatos del panel. La moneda reutiliza el formato de la tienda (centavos → "$1,899").
import { formatPrice } from '../../lib/format'
export { formatPrice as formatoMoneda }

const fechaCorta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
const fechaHora = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const numero = new Intl.NumberFormat('es-MX')

export const formatoFecha = (iso) => (iso ? fechaCorta.format(new Date(iso)) : '—')
export const formatoFechaHora = (iso) => (iso ? fechaHora.format(new Date(iso)) : '—')
export const formatoNumero = (n) => numero.format(n ?? 0)

const monedaCompacta = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact', maximumFractionDigits: 1 })
/** Centavos → "$19.8 M" para cifras de un millón o más; debajo, el formato normal. */
export const formatoMonedaCompacta = (centavos) =>
  Math.abs(centavos) >= 100000000 ? monedaCompacta.format(centavos / 100) : formatPrice(centavos)

/** Cantidad con signo para movimientos: +3 / −2 */
export const formatoCantidad = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
