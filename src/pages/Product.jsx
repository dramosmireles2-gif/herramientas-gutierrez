import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProduct, getRelatedProducts } from '../services/catalog'
import { buildProductQuestionUrl } from '../services/whatsapp'
import { useAsync } from '../hooks/useAsync'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBranch } from '../context/BranchContext'
import { useCart } from '../context/CartContext'
import ProductImage from '../components/ProductImage'
import WhatsAppLink from '../components/WhatsAppLink'
import Price from '../components/Price'
import StockBadge from '../components/StockBadge'
import QuantityStepper from '../components/QuantityStepper'
import { ProductGrid } from '../components/ProductGrid'
import { CartIcon, PinIcon, StoreIcon, WhatsAppIcon } from '../components/icons'
import NotFound from './NotFound'

function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [images])
  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5 md:p-8">
        <ProductImage src={images[active]} alt={name} eager />
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button" onClick={() => setActive(i)}
                className={`w-16 rounded-lg bg-blanco p-1 ring-2 ${i === active ? 'ring-hielo' : 'ring-transparent'}`}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`} aria-current={i === active}
              >
                <ProductImage src={src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="container-page grid animate-pulse gap-8 py-8 md:grid-cols-2" aria-hidden="true">
      <div className="aspect-square rounded-2xl bg-blanco" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-blanco" />
        <div className="h-10 rounded bg-blanco" />
        <div className="h-10 w-1/2 rounded bg-blanco" />
        <div className="h-12 rounded bg-blanco" />
      </div>
    </div>
  )
}

export default function Product() {
  const { slug } = useParams()
  const { data: product, loading } = useAsync(() => getProduct(slug), [slug])
  const { data: related } = useAsync(() => getRelatedProducts(product, 4), [product])
  const { branch, openPicker } = useBranch()
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  useEffect(() => setQty(1), [slug])

  usePageMeta(product?.name ?? (loading ? null : 'Producto no encontrado'), product?.short_description || undefined)

  if (loading) return <ProductSkeleton />
  if (!product) return <NotFound title="No encontramos este producto" />

  const soldOut = product.stock <= 0
  const askUrl = (b) => buildProductQuestionUrl(product, b, { outOfStock: soldOut })
  const specs = Object.entries(product.specs)
  const addToCart = () => add(product, qty)

  return (
    <div className="pb-28 lg:pb-0">
      <div className="container-page py-6 md:py-10">
        <nav aria-label="Ruta" className="mb-4 text-sm text-gris">
          <ol className="flex flex-wrap gap-1">
            <li><Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span></li>
            {product.category && (
              <li>
                <Link to={`/catalogo?categoria=${product.category.slug}`} className="hover:underline">{product.category.name}</Link>{' '}
                <span aria-hidden="true">/</span>
              </li>
            )}
            <li aria-current="page" className="line-clamp-1 text-texto">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          <Gallery images={product.images} name={product.name} />

          <div>
            {product.brand && (
              <Link to={`/catalogo?marca=${product.brand.slug}`} className="text-sm font-bold uppercase tracking-wide text-hielo-texto hover:underline">
                {product.brand.name}
              </Link>
            )}
            <h1 className="mt-1 text-4xl uppercase leading-[0.95] text-titanio md:text-5xl">{product.name}</h1>
            <p className="mt-2 text-sm text-gris">SKU {product.sku}</p>

            <Price price={product.price} compareAt={product.compare_at_price} size="lg" className="mt-5" />
            <p className="mt-1 text-sm text-gris">Precio en pesos mexicanos (MXN)</p>
            <StockBadge stock={product.stock} className="mt-3 text-base" />

            {product.short_description && <p className="mt-5 text-lg leading-relaxed">{product.short_description}</p>}

            <div className="mt-6 space-y-3">
              {!soldOut && (
                <div className="flex items-center gap-3">
                  <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
                  <button type="button" onClick={addToCart} className="btn-primary hidden h-12 flex-1 text-lg lg:flex">
                    <CartIcon /> Agregar al carrito
                  </button>
                </div>
              )}
              <WhatsAppLink
                buildUrl={askUrl}
                className={`${soldOut ? 'btn-whatsapp' : 'btn border-2 border-whatsapp text-titanio hover:bg-whatsapp/10'} h-12 w-full`}
              >
                <WhatsAppIcon /> {soldOut ? 'Avísame cuando llegue' : 'Preguntar por WhatsApp'}
              </WhatsAppLink>
            </div>

            <ul className="mt-6 space-y-2 rounded-xl bg-blanco p-4 text-sm shadow-sm ring-1 ring-titanio/5">
              <li className="flex items-center gap-2">
                <StoreIcon width={20} height={20} className="shrink-0 text-hielo-texto" />
                Recoge en tienda en cualquiera de nuestras 5 sucursales
              </li>
              <li className="flex items-center gap-2">
                <PinIcon width={20} height={20} className="shrink-0 text-hielo-texto" />
                <span>
                  {branch ? `Te atiende la sucursal ${branch.city}` : 'Elige tu sucursal para recoger y cotizar'}
                  {' · '}
                  <button type="button" onClick={openPicker} className="font-semibold text-hielo-texto hover:underline">
                    {branch ? 'Cambiar' : 'Elegir'}
                  </button>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {specs.length > 0 && (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-3xl uppercase text-titanio">Especificaciones</h2>
            <table className="mt-4 w-full overflow-hidden rounded-xl bg-blanco text-left text-sm shadow-sm ring-1 ring-titanio/5">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-b border-fondo last:border-0">
                    <th scope="row" className="w-2/5 bg-fondo/50 px-4 py-3 font-semibold text-titanio">{k}</th>
                    <td className="px-4 py-3">{v}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="w-2/5 bg-fondo/50 px-4 py-3 font-semibold text-titanio">Marca</th>
                  <td className="px-4 py-3">{product.brand?.name ?? 'Por confirmar'}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {related?.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-3xl uppercase text-titanio">También te puede interesar</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      {/* Barra CTA fija en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-titanio/10 bg-blanco px-4 py-3 shadow-[0_-4px_16px_rgba(43,52,64,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-page items-center gap-3">
          <div className="min-w-0">
            <Price price={product.price * (soldOut ? 1 : qty)} size="md" className="leading-none" />
            <p className="mt-0.5 text-xs text-gris">{soldOut ? 'Agotado' : qty > 1 ? `${qty} piezas` : '1 pieza'}</p>
          </div>
          {soldOut ? (
            <WhatsAppLink buildUrl={askUrl} className="btn-whatsapp ml-auto h-12 flex-1">
              <WhatsAppIcon /> Avísame
            </WhatsAppLink>
          ) : (
            <button type="button" onClick={addToCart} className="btn-primary ml-auto h-12 flex-1">
              <CartIcon /> Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
