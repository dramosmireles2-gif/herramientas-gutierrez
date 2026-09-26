const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const mxnWhole = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

/** Precio en centavos -> "$1,899" (o "$1,899.50" si trae centavos). */
export const formatPrice = (cents) => (cents % 100 === 0 ? mxnWhole : mxn).format(cents / 100)
