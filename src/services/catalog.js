// Única capa que lee el catálogo. La UI nunca importa los JSON directo.
// Las funciones son async para que el cambio a Supabase no toque la UI.
import productsData from '../data/products.json'
import categoriesData from '../data/categories.json'
import brandsData from '../data/brands.json'

const brandById = new Map(brandsData.map((b) => [b.id, b]))
const categoryById = new Map(categoriesData.map((c) => [c.id, c]))

export const normalize = (s = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[.,]/g, '').trim()

// Imágenes locales viven en public/ y necesitan el base de GitHub Pages; URLs absolutas (Supabase Storage) pasan tal cual.
const resolveImage = (src) => (/^https?:\/\//.test(src) ? src : `${import.meta.env.BASE_URL}${src}`)

const hydrate = (p) => ({
  ...p,
  images: p.images.map(resolveImage),
  brand: brandById.get(p.brand_id) ?? null,
  category: categoryById.get(p.category_id) ?? null,
  in_stock: p.stock > 0,
})

const activeProducts = productsData.filter((p) => p.active).map(hydrate)

const searchIndex = new Map(
  activeProducts.map((p) => [
    p.id,
    {
      name: normalize(p.name),
      rest: normalize([p.brand?.name, p.category?.name, p.sku, p.short_description, ...Object.values(p.specs)].join(' ')),
    },
  ]),
)

// Puntaje de relevancia: todas las palabras deben aparecer; pesan más en el nombre.
function score(product, terms) {
  const idx = searchIndex.get(product.id)
  let total = 0
  for (const t of terms) {
    if (idx.name.includes(t)) total += idx.name.split(/\s+/).some((w) => w.startsWith(t)) ? 3 : 2
    else if (idx.rest.includes(t)) total += 1
    else return 0
  }
  return total
}

const byName = (a, b) => a.name.localeCompare(b.name, 'es')

const SORTS = {
  relevancia: null,
  'precio-asc': (a, b) => a.price - b.price || byName(a, b),
  'precio-desc': (a, b) => b.price - a.price || byName(a, b),
  nombre: byName,
}
export const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Más relevantes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
]

/**
 * @param {object} f
 * @param {string} [f.q] texto de búsqueda
 * @param {string|string[]} [f.category] slug(s) de categoría
 * @param {string|string[]} [f.brand] slug(s) de marca
 * @param {number} [f.minPrice] pesos (no centavos)
 * @param {number} [f.maxPrice] pesos (no centavos)
 * @param {boolean} [f.inStock]
 * @param {keyof SORTS} [f.sort]
 * @param {number} [f.page] desde 1
 * @param {number} [f.pageSize]
 */
export async function getProducts({
  q = '', category, brand, minPrice, maxPrice, inStock = false, sort = 'relevancia', page = 1, pageSize = 12,
} = {}) {
  const toSet = (v) => new Set((Array.isArray(v) ? v : v ? [v] : []).filter(Boolean))
  const cats = toSet(category)
  const brs = toSet(brand)
  const terms = normalize(q).split(/\s+/).filter(Boolean)

  let list = activeProducts
    .map((p) => ({ p, s: terms.length ? score(p, terms) : 0 }))
    .filter(({ p, s }) =>
      (!terms.length || s > 0) &&
      (!cats.size || cats.has(p.category?.slug)) &&
      (!brs.size || brs.has(p.brand?.slug)) &&
      (minPrice == null || p.price >= minPrice * 100) &&
      (maxPrice == null || p.price <= maxPrice * 100) &&
      (!inStock || p.in_stock),
    )

  const cmp = SORTS[sort]
  list = cmp
    ? list.sort((a, b) => cmp(a.p, b.p))
    // Relevancia: puntaje de búsqueda, luego destacados, luego con existencia.
    : list.sort((a, b) => b.s - a.s || b.p.featured - a.p.featured || b.p.in_stock - a.p.in_stock || byName(a.p, b.p))

  const items = list.map(({ p }) => p)
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    total,
    page: current,
    pageCount,
    pageSize,
  }
}

export async function getProduct(slug) {
  return activeProducts.find((p) => p.slug === slug) ?? null
}

export async function getFeaturedProducts(limit = 8) {
  return activeProducts.filter((p) => p.featured).slice(0, limit)
}

/** Misma categoría primero (con existencia), luego misma marca. */
export async function getRelatedProducts(product, limit = 4) {
  if (!product) return []
  const others = activeProducts.filter((p) => p.id !== product.id)
  const sameCat = others.filter((p) => p.category_id === product.category_id)
    .sort((a, b) => b.in_stock - a.in_stock || Math.abs(a.price - product.price) - Math.abs(b.price - product.price))
  const sameBrand = others.filter((p) => p.brand_id && p.brand_id === product.brand_id && p.category_id !== product.category_id)
  return [...sameCat, ...sameBrand].slice(0, limit)
}

/** Categorías con número de productos activos. */
export async function getCategories() {
  return categoriesData.map((c) => ({ ...c, count: activeProducts.filter((p) => p.category_id === c.id).length }))
}

export async function getCategory(slug) {
  return categoriesData.find((c) => c.slug === slug) ?? null
}

/** Solo marcas con al menos un producto activo. */
export async function getBrands() {
  return brandsData
    .map((b) => ({ ...b, count: activeProducts.filter((p) => p.brand_id === b.id).length }))
    .filter((b) => b.count > 0)
}

/** Rango de precios del catálogo en pesos, para el filtro. */
export async function getPriceRange() {
  const prices = activeProducts.map((p) => p.price / 100)
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
}
