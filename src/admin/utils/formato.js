// Formatos del panel. La moneda reutiliza el formato de la tienda (centavos → "$1,899").
export { formatPrice as formatoMoneda } from '../../lib/format'

const fechaCorta = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
const fechaHora = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const numero = new Intl.NumberFormat('es-MX')

export const formatoFecha = (iso) => (iso ? fechaCorta.format(new Date(iso)) : '—')
export const formatoFechaHora = (iso) => (iso ? fechaHora.format(new Date(iso)) : '—')
export const formatoNumero = (n) => numero.format(n ?? 0)

/** Cantidad con signo para movimientos: +3 / −2 */
export const formatoCantidad = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0')
