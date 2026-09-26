import { formatPrice } from '../lib/format'

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl md:text-5xl',
}

export default function Price({ price, compareAt, size = 'sm', className = '' }) {
  const discounted = compareAt && compareAt > price
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className={`price text-titanio ${sizes[size]}`}>{formatPrice(price)}</span>
      {discounted && (
        <>
          <span className="text-sm text-gris line-through">
            <span className="sr-only">Antes </span>
            {formatPrice(compareAt)}
          </span>
          <span className="rounded bg-titanio px-1.5 py-0.5 text-xs font-bold text-blanco">
            -{Math.round((1 - price / compareAt) * 100)}%
          </span>
        </>
      )}
    </div>
  )
}
