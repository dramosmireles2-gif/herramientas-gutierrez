import { Link } from 'react-router-dom'
import { getBrands, getCategories, getFeaturedProducts } from '../services/catalog'
import { getBranches } from '../services/branches'
import { buildGeneralUrl } from '../services/whatsapp'
import { useAsync } from '../hooks/useAsync'
import { usePageMeta } from '../hooks/usePageMeta'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import WhatsAppLink from '../components/WhatsAppLink'
import ProductImage from '../components/ProductImage'
import { CategoryIcon, ChevronRightIcon, PinIcon, ShieldIcon, StoreIcon, WhatsAppIcon } from '../components/icons'

const benefits = [
  { Icon: StoreIcon, title: 'Recoge en tu sucursal', text: 'Compra en línea y pasa por tu pedido.' },
  { Icon: WhatsAppIcon, title: 'Asesoría por WhatsApp', text: 'Te ayudamos a elegir el equipo correcto.' },
  { Icon: ShieldIcon, title: 'Marcas que aguantan', text: 'Predator, DeWalt, Ryobi, Champion y más.' },
]

function SectionHeading({ title, to, linkLabel }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-3xl uppercase text-titanio md:text-4xl">{title}</h2>
      {to && (
        <Link to={to} className="flex shrink-0 items-center gap-1 text-sm font-bold text-hielo-texto hover:underline">
          {linkLabel} <ChevronRightIcon width={16} height={16} />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  usePageMeta(null)
  const { data: featured } = useAsync(() => getFeaturedProducts(8), [])
  const { data: categories } = useAsync(getCategories, [])
  const { data: brands } = useAsync(getBrands, [])
  const { data: branches } = useAsync(getBranches, [])
  const heroProduct = featured?.[0]

  return (
    <>
      {/* Hero */}
      <section className="bg-titanio text-blanco">
        <div className="container-page grid items-center gap-8 py-12 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-hielo">5 sucursales en el noreste</p>
            <h1 className="mt-3 text-5xl uppercase leading-[0.92] md:text-7xl">
              Todo para la obra, en 5 sucursales del noreste
            </h1>
            <p className="mt-5 max-w-xl text-lg text-blanco/85">
              Generadores, hidrolavadoras, compresores y herramienta de trabajo pesado. Compra en línea o pide por WhatsApp y recoge en tu sucursal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
              <Link to="/sucursales" className="btn border border-blanco/30 text-blanco hover:bg-blanco/10">
                <PinIcon width={20} height={20} /> Sucursales
              </Link>
            </div>
          </div>
          {heroProduct && (
            <Link
              to={`/producto/${heroProduct.slug}`}
              className="hidden rounded-2xl bg-blanco p-6 text-texto shadow-xl md:block"
            >
              <ProductImage src={heroProduct.images[0]} srcSet={heroProduct.image_srcsets?.[0]} sizes="40vw" alt={heroProduct.name} eager />
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gris">{heroProduct.brand?.name}</p>
              <p className="font-semibold">{heroProduct.name}</p>
            </Link>
          )}
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-b border-titanio/10 bg-blanco">
        <ul className="container-page grid gap-4 py-5 sm:grid-cols-3">
          {benefits.map(({ Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fondo text-hielo-texto">
                <Icon width={22} height={22} />
              </span>
              <div>
                <p className="font-bold text-titanio">{title}</p>
                <p className="text-sm text-gris">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Categorías */}
      <section className="container-page pt-12">
        <SectionHeading title="Categorías" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories?.map((c) => (
            <li key={c.id}>
              <Link
                to={`/catalogo?categoria=${c.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-xl bg-blanco p-4 text-center shadow-sm ring-1 ring-titanio/5 transition hover:ring-hielo"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-fondo text-titanio">
                  <CategoryIcon name={c.icon} width={30} height={30} strokeWidth={1.7} />
                </span>
                <span className="font-condensed text-lg uppercase leading-tight text-titanio">{c.name}</span>
                <span className="text-xs text-gris">{c.count} productos</span>
              </Link>
            </li>
          ))}
          {categories && (
            <li>
              <Link
                to="/catalogo"
                className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-titanio p-4 text-center text-blanco transition hover:bg-texto"
              >
                <span className="font-condensed text-lg uppercase leading-tight">Ver todo</span>
                <ChevronRightIcon />
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* Destacados */}
      <section className="container-page pt-14">
        <SectionHeading title="Destacados" to="/catalogo" linkLabel="Ver catálogo" />
        {featured ? <ProductGrid products={featured} /> : <ProductGridSkeleton count={4} />}
      </section>

      {/* Marcas */}
      <section className="container-page pt-14">
        <SectionHeading title="Marcas" />
        <ul className="flex flex-wrap gap-2">
          {brands?.map((b) => (
            <li key={b.id}>
              <Link
                to={`/catalogo?marca=${b.slug}`}
                className="block rounded-lg bg-blanco px-4 py-2.5 font-condensed text-lg uppercase text-titanio shadow-sm ring-1 ring-titanio/5 hover:ring-hielo"
              >
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sucursales */}
      <section className="mt-14 bg-titanio text-blanco">
        <div className="container-page py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl uppercase md:text-4xl">5 sucursales en el noreste</h2>
              <p className="mt-1 text-blanco/80">Pide en línea y recoge en la que te quede más cerca.</p>
            </div>
            <Link to="/sucursales" className="hidden shrink-0 items-center gap-1 text-sm font-bold text-hielo hover:underline sm:flex">
              Ver sucursales <ChevronRightIcon width={16} height={16} />
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {branches?.map((b) => (
              <li key={b.id}>
                <Link to="/sucursales" className="flex items-center gap-3 rounded-xl bg-blanco/5 p-4 ring-1 ring-blanco/10 hover:bg-blanco/10">
                  <PinIcon className="shrink-0 text-hielo" />
                  <span>
                    <span className="block font-bold">{b.city}</span>
                    <span className="block text-sm text-blanco/70">{b.state}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="container-page pt-14">
        <div className="flex flex-col items-start gap-5 rounded-2xl bg-blanco p-6 shadow-sm ring-1 ring-titanio/5 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-3xl uppercase text-titanio">¿No sabes cuál te conviene?</h2>
            <p className="mt-2 max-w-xl text-gris">
              Dinos para qué lo necesitas y te recomendamos el equipo adecuado, con precio y existencia en tu sucursal.
            </p>
          </div>
          <WhatsAppLink buildUrl={buildGeneralUrl} className="btn-whatsapp shrink-0">
            <WhatsAppIcon /> Escríbenos por WhatsApp
          </WhatsAppLink>
        </div>
      </section>
    </>
  )
}
