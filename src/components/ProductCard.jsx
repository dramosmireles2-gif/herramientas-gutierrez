import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import Price from './Price'
import StockBadge from './StockBadge'

export default function ProductCard({ product, eager = false }) {
  const soldOut = product.stock <= 0
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5 transition-shadow hover:shadow-md">
      <div className="relative p-3">
        <ProductImage
          src={product.images[0]}
          srcSet={product.image_srcsets?.[0]}
          sizes="(min-width: 1280px) 240px, (min-width: 768px) 30vw, 45vw"
          alt={product.name}
          eager={eager}
          className={soldOut ? 'opacity-50' : ''}
        />
        {soldOut && (
          <span className="absolute left-3 top-3 rounded bg-agotado px-2 py-0.5 text-xs font-bold text-blanco">Agotado</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 border-t border-fondo p-3">
        {product.brand && <p className="text-xs font-bold uppercase tracking-wide text-gris">{product.brand.name}</p>}
        <h3 className="line-clamp-3 font-sans text-sm font-semibold leading-snug text-texto [font-stretch:normal]">
          {/* El ::after cubre toda la tarjeta: la hace clicable y dibuja el foco visible (sin :has, que es caro en estilos). */}
          <Link
            to={`/producto/${product.slug}`}
            className="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-[3px] focus-visible:after:ring-hielo-texto"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-2">
          <Price price={product.price} compareAt={product.compare_at_price} />
          {!soldOut && <StockBadge stock={product.stock} className="mt-1 text-xs" />}
        </div>
      </div>
    </article>
  )
}
