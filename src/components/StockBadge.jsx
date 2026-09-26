const LOW_STOCK = 3

export default function StockBadge({ stock, className = '' }) {
  if (stock <= 0) {
    return <span className={`text-sm font-bold text-agotado ${className}`}>Agotado</span>
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold text-ok ${className}`}>
      <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
      {stock <= LOW_STOCK ? `Últimas ${stock} ${stock === 1 ? 'pieza' : 'piezas'}` : 'En existencia'}
    </span>
  )
}
