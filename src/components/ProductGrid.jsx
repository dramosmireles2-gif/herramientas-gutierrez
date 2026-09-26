import ProductCard from './ProductCard'

export function ProductGrid({ products, eagerCount = 0, className = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <ul className={`grid gap-3 sm:gap-4 ${className}`}>
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <div className="w-full [&>article]:h-full">
            <ProductCard product={p} eager={i < eagerCount} />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({ count = 8, className = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' }) {
  return (
    <ul className={`grid gap-3 sm:gap-4 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="animate-pulse rounded-xl bg-blanco p-3">
          <div className="aspect-square rounded bg-fondo" />
          <div className="mt-3 h-3 w-1/3 rounded bg-fondo" />
          <div className="mt-2 h-4 rounded bg-fondo" />
          <div className="mt-4 h-6 w-1/2 rounded bg-fondo" />
        </li>
      ))}
    </ul>
  )
}
