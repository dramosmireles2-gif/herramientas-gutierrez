import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../lib/format'
import ProductImage from './ProductImage'
import QuantityStepper from './QuantityStepper'

export default function CartLine({ line, onNavigate, compact = false }) {
  const { setQty, remove } = useCart()
  const { product, qty, total } = line

  return (
    <li className="flex gap-3 py-4">
      <Link
        to={`/producto/${product.slug}`}
        onClick={onNavigate}
        className={`shrink-0 self-start rounded-lg bg-blanco ring-1 ring-titanio/10 ${compact ? 'w-20' : 'w-24 sm:w-28'}`}
      >
        <ProductImage src={product.images[0]} srcSet={product.image_srcsets?.[0]} sizes="112px" alt={product.name} className="rounded-lg" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            {product.brand && <p className="text-xs font-bold uppercase text-gris">{product.brand.name}</p>}
            <Link to={`/producto/${product.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold hover:underline">
              {product.name}
            </Link>
            <p className="text-xs text-gris">{formatPrice(product.price)} c/u</p>
          </div>
          <p className="price shrink-0 text-lg text-titanio">{formatPrice(total)}</p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantityStepper
            id={`qty-${product.id}${compact ? '-d' : ''}`}
            value={qty}
            max={product.stock}
            onChange={(q) => setQty(product.id, q)}
            size="sm"
          />
          <button type="button" onClick={() => remove(product.id)} className="px-2 py-2 text-sm font-semibold text-agotado hover:underline">
            Quitar<span className="sr-only"> {product.name}</span>
          </button>
        </div>
        {qty >= product.stock && <p className="mt-1 text-xs text-gris">Máximo disponible: {product.stock}</p>}
      </div>
    </li>
  )
}
