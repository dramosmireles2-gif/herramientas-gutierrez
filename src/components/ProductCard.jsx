import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import Price from './Price'
import StockBadge from './StockBadge'

export default function ProductCard({ product, eager = false }) {
  const soldOut = product.stock <= 0
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5 transition-shadow hover:shadow-md">
      <div className="relative p-3">
        <ProductImage src={product.images[0]} alt={product.name} eager={eager} className={soldOut ? 'opacity-50' : ''} />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded bg-agotado px-2 py-0.5 text-xs font-bold text-blanco">Agotado</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-fondo p-3">
        {product.brand && <p className="text-xs font-bold uppercase tracking-wide text-gris">{product.brand.name}</p>}
        <h3 className="line-clamp-3 font-sans text-sm font-semibold leading-snug text-texto [font-stretch:normal]">
          <Link to={`/producto/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-2">
          <Price price={product.price} compareAt={product.compare_at_price} />
          {!soldOut && <StockBadge stock={product.stock} className="mt-1 text-xs" />}
        </div>
      </div>
      {/* Foco visible sobre toda la tarjeta cuando se navega con teclado */}
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-hielo-texto group-has-[:focus-visible]:ring-[3px]" aria-hidden="true" />
    </article>
  )
}
