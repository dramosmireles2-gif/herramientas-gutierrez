// Genera src/data/{products,categories,brands}.json desde catalogo_borrador.csv
// y copia las imágenes de Productos_web/ a public/img/productos/.
// Uso: node scripts/build-products.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { details } from './product-details.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CSV = join(root, 'catalogo_borrador.csv')
const IMG_SRC = join(root, 'Productos_web')
const IMG_DEST = join(root, 'public', 'img', 'productos')
const DATA = join(root, 'src', 'data')

// Orden en que se muestran; icon es un nombre para la UI.
const CATEGORY_META = {
  Generadores: { icon: 'generador', sku: 'GEN' },
  Hidrolavadoras: { icon: 'hidrolavadora', sku: 'HID' },
  Compresores: { icon: 'compresor', sku: 'COM' },
  Podadoras: { icon: 'podadora', sku: 'POD' },
  Carpintería: { icon: 'carpinteria', sku: 'CAR' },
  Construcción: { icon: 'construccion', sku: 'CON' },
  Automotriz: { icon: 'automotriz', sku: 'AUT' },
}
const NO_BRAND = 'Por confirmar'

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  text = text.replace(/^﻿/, '')
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [header, ...body] = rows
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

const rows = parseCsv(readFileSync(CSV, 'utf8'))
const errors = []

// Categorías
const categories = Object.entries(CATEGORY_META).map(([name, meta]) => ({
  id: slugify(name), slug: slugify(name), name, icon: meta.icon,
}))
for (const r of rows) {
  if (!CATEGORY_META[r.categoria]) errors.push(`Categoría desconocida "${r.categoria}" en ${r.slug}`)
}

// Marcas (orden alfabético)
const brandNames = [...new Set(rows.map((r) => r.marca).filter((m) => m && m !== NO_BRAND))]
  .sort((a, b) => a.localeCompare(b, 'es'))
const brands = brandNames.map((name) => ({ id: slugify(name), slug: slugify(name), name }))

// Productos
mkdirSync(IMG_DEST, { recursive: true })
const skuCounters = {}
const products = rows.map((r, i) => {
  const d = details[r.slug]
  if (!d) errors.push(`Falta ${r.slug} en scripts/product-details.mjs`)

  const img = r.imagen || `${r.slug}.webp`
  const src = join(IMG_SRC, img)
  const images = []
  if (existsSync(src)) {
    copyFileSync(src, join(IMG_DEST, img))
    images.push(`img/productos/${img}`)
  } else {
    errors.push(`No existe la imagen ${img}`)
  }

  const prefix = CATEGORY_META[r.categoria]?.sku ?? 'GEN'
  skuCounters[prefix] = (skuCounters[prefix] ?? 0) + 1
  const csvPrice = Number(String(r.precio_mxn).replace(/[$,\s]/g, ''))
  const hasPrice = r.precio_mxn !== '' && Number.isFinite(csvPrice) && csvPrice > 0
  const csvStock = Number(r.stock)
  const hasStock = r.stock !== '' && Number.isInteger(csvStock)

  const product = {
    id: `p-${String(i + 1).padStart(3, '0')}`,
    sku: r.sku || `${prefix}-${String(skuCounters[prefix]).padStart(3, '0')}`,
    slug: r.slug,
    name: r.nombre,
    brand_id: r.marca && r.marca !== NO_BRAND ? slugify(r.marca) : null,
    category_id: slugify(r.categoria),
    price: Math.round((hasPrice ? csvPrice : d?.price ?? 0) * 100), // centavos
    compare_at_price: !hasPrice && d?.compare ? d.compare * 100 : null,
    stock: hasStock ? csvStock : d?.stock ?? 0,
    short_description: d?.short ?? '',
    specs: d?.specs ?? {},
    images,
    featured: Boolean(d?.featured),
    sort_order: d?.order ?? 100 + i, // menor = aparece primero (destacados, relevancia)
    active: true,
  }
  if (!hasPrice) product.demo_price = true
  return product
})

if (errors.length) {
  console.error('Errores:\n- ' + errors.join('\n- '))
  process.exit(1)
}

mkdirSync(DATA, { recursive: true })
const write = (name, data) => writeFileSync(join(DATA, name), JSON.stringify(data, null, 2) + '\n')
write('categories.json', categories)
write('brands.json', brands)
write('products.json', products)

console.log(`${products.length} productos · ${categories.length} categorías · ${brands.length} marcas · ${products.filter((p) => p.images.length).length} imágenes copiadas`)
