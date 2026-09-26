import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SORT_OPTIONS, getBrands, getCategories, getPriceRange, getProducts } from '../services/catalog'
import { useAsync } from '../hooks/useAsync'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice } from '../lib/format'
import CatalogFilters from '../components/CatalogFilters'
import Drawer from '../components/Drawer'
import { ProductGrid, ProductGridSkeleton } from '../components/ProductGrid'
import { FilterIcon, SearchIcon, XIcon } from '../components/icons'

const PAGE_SIZE = 12
const num = (v) => (v == null || v === '' || Number.isNaN(Number(v)) ? undefined : Number(v))

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // La URL es la fuente de verdad: los filtros se pueden compartir y sobreviven a recargar.
  const filters = useMemo(() => ({
    q: params.get('q') ?? '',
    category: params.getAll('categoria'),
    brand: params.getAll('marca'),
    minPrice: num(params.get('min')),
    maxPrice: num(params.get('max')),
    inStock: params.get('existencia') === '1',
    sort: params.get('orden') ?? 'relevancia',
  }), [params])
  const pagesShown = Math.max(1, num(params.get('ver')) ?? 1)

  // Datos de filtros en una sola carga (menos re-renders mientras llega la página).
  const { data: facets } = useAsync(
    () => Promise.all([getCategories(), getBrands(), getPriceRange()]).then(([categories, brands, priceRange]) => ({ categories, brands, priceRange })),
    [],
  )
  const { categories, brands, priceRange } = facets ?? {}
  const { data: result, loading } = useAsync(
    () => getProducts({ ...filters, page: 1, pageSize: PAGE_SIZE * pagesShown }),
    [params.toString()],
  )

  const update = useCallback((mutate, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params)
    mutate(next)
    if (!keepPage) next.delete('ver')
    setParams(next, { replace: true })
  }, [params, setParams])

  const toggle = (key, value) => update((n) => {
    const values = n.getAll(key)
    n.delete(key)
    const nextValues = values.includes(value) ? values.filter((v) => v !== value) : [...values, value]
    nextValues.forEach((v) => n.append(key, v))
  })
  const setPrice = (min, max) => update((n) => {
    min != null ? n.set('min', min) : n.delete('min')
    max != null ? n.set('max', max) : n.delete('max')
  })
  const setInStock = (on) => update((n) => (on ? n.set('existencia', '1') : n.delete('existencia')))
  const setSort = (value) => update((n) => (value === 'relevancia' ? n.delete('orden') : n.set('orden', value)))
  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  // Chips de filtros activos
  const catName = (slug) => categories?.find((c) => c.slug === slug)?.name ?? slug
  const brandName = (slug) => brands?.find((b) => b.slug === slug)?.name ?? slug
  const chips = [
    filters.q && { key: 'q', label: `“${filters.q}”`, remove: () => update((n) => n.delete('q')) },
    ...filters.category.map((s) => ({ key: `c-${s}`, label: catName(s), remove: () => toggle('categoria', s) })),
    ...filters.brand.map((s) => ({ key: `b-${s}`, label: brandName(s), remove: () => toggle('marca', s) })),
    (filters.minPrice != null || filters.maxPrice != null) && {
      key: 'price',
      label: [
        filters.minPrice != null ? `desde ${formatPrice(filters.minPrice * 100)}` : null,
        filters.maxPrice != null ? `hasta ${formatPrice(filters.maxPrice * 100)}` : null,
      ].filter(Boolean).join(' '),
      remove: () => setPrice(undefined, undefined),
    },
    filters.inStock && { key: 'stock', label: 'En existencia', remove: () => setInStock(false) },
  ].filter(Boolean)
  const filterCount = chips.filter((c) => c.key !== 'q').length

  const title = filters.q
    ? `Resultados para “${filters.q}”`
    : filters.category.length === 1 && !filters.brand.length
      ? catName(filters.category[0])
      : filters.brand.length === 1 && !filters.category.length
        ? brandName(filters.brand[0])
        : 'Catálogo'
  usePageMeta(title === 'Catálogo' ? 'Catálogo' : `${title} · Catálogo`)

  const filterProps = {
    filters, categories, brands, priceRange,
    onToggle: toggle, onPrice: setPrice, onInStock: setInStock,
  }
  const total = result?.total ?? 0
  const resultsLabel = `${total} ${total === 1 ? 'producto' : 'productos'}`

  return (
    <div className="container-page py-6 md:py-10">
      <nav aria-label="Ruta" className="mb-2 text-sm text-gris">
        <Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span> Catálogo
      </nav>
      <h1 className="text-4xl uppercase text-titanio md:text-5xl">{title}</h1>

      <div className="mt-6 lg:grid lg:grid-cols-[16rem_1fr] lg:gap-8">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-24 rounded-xl bg-blanco p-4 shadow-sm ring-1 ring-titanio/5">
            <CatalogFilters {...filterProps} idPrefix="side" />
          </div>
        </aside>

        <section aria-labelledby="resultados-titulo">
          <h2 id="resultados-titulo" className="sr-only">Resultados</h2>
          {/* Barra de herramientas */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-blanco px-4 font-bold text-titanio shadow-sm ring-1 ring-titanio/10 lg:hidden"
            >
              <FilterIcon width={20} height={20} />
              Filtros
              {filterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-hielo px-1 text-xs text-cta-ink">{filterCount}</span>
              )}
            </button>
            <p className="hidden text-sm text-gris lg:block" aria-live="polite">{loading ? 'Buscando…' : resultsLabel}</p>
            <div className="ml-auto">
              <label htmlFor="orden" className="sr-only">Ordenar por</label>
              <select
                id="orden"
                value={filters.sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 rounded-lg border-0 bg-blanco pl-3 pr-8 text-sm font-semibold text-titanio shadow-sm ring-1 ring-titanio/10"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <p className="mt-3 text-sm text-gris lg:hidden" aria-live="polite">{loading ? 'Buscando…' : resultsLabel}</p>

          {chips.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={c.remove}
                    className="flex items-center gap-1.5 rounded-full bg-titanio py-1.5 pl-3 pr-2 text-sm font-semibold text-blanco hover:bg-texto"
                    aria-label={`Quitar filtro ${c.label}`}
                  >
                    {c.label} <XIcon width={14} height={14} />
                  </button>
                </li>
              ))}
              {chips.length > 1 && (
                <li>
                  <button type="button" onClick={clearAll} className="px-2 py-1.5 text-sm font-bold text-hielo-texto hover:underline">
                    Limpiar todo
                  </button>
                </li>
              )}
            </ul>
          )}

          <div className="mt-4">
            {!result ? (
              <ProductGridSkeleton className="grid-cols-2 md:grid-cols-3" count={6} />
            ) : total === 0 ? (
              <EmptyResults query={filters.q} hasFilters={filterCount > 0} onClear={clearAll} categories={categories} />
            ) : (
              <>
                <ProductGrid products={result.items} eagerCount={2}className="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" />
                <div className="mt-8 text-center">
                  <p className="text-sm text-gris">Viendo {result.items.length} de {total}</p>
                  {result.items.length < total && (
                    <button
                      type="button"
                      onClick={() => update((n) => n.set('ver', String(pagesShown + 1)), { keepPage: true })}
                      className="btn mt-3 bg-titanio text-blanco hover:bg-texto"
                    >
                      Cargar más productos
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filtros"
        footer={
          <div className="flex gap-3">
            {filterCount > 0 && (
              <button type="button" onClick={clearAll} className="btn flex-1 border border-titanio/20 text-titanio">Limpiar</button>
            )}
            <button type="button" onClick={() => setDrawerOpen(false)} className="btn-primary flex-[2]">
              Ver {resultsLabel}
            </button>
          </div>
        }
      >
        <CatalogFilters {...filterProps} idPrefix="drawer" />
      </Drawer>
    </div>
  )
}

function EmptyResults({ query, hasFilters, onClear, categories }) {
  return (
    <div className="rounded-xl bg-blanco px-6 py-12 text-center shadow-sm ring-1 ring-titanio/5">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fondo text-gris">
        <SearchIcon width={30} height={30} />
      </span>
      <h2 className="mt-4 text-3xl uppercase text-titanio">Sin resultados</h2>
      <p className="mx-auto mt-2 max-w-md text-gris">
        {query
          ? `No encontramos productos para “${query}”${hasFilters ? ' con estos filtros' : ''}. Revisa la ortografía o prueba con otra palabra.`
          : 'Ningún producto coincide con estos filtros. Quita alguno para ver más opciones.'}
      </p>
      <button type="button" onClick={onClear} className="btn-primary mt-6">Ver todo el catálogo</button>
      {categories && (
        <div className="mt-8">
          <p className="text-sm font-semibold text-titanio">O explora una categoría:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/catalogo?categoria=${c.slug}`} className="block rounded-full bg-fondo px-3 py-1.5 text-sm font-semibold text-titanio hover:bg-titanio hover:text-blanco">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
