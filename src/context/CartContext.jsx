import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProductsByIds } from '../services/catalog'
import { readJSON, writeJSON } from '../lib/storage'

const STORAGE_KEY = 'hg-cart'
const CartContext = createContext(null)

// Solo se guarda { product_id, qty }. Precio, nombre y existencia se leen del catálogo
// para no mostrar datos viejos. El total real lo calculará el servidor en producción.
const loadStored = () => {
  const raw = readJSON(STORAGE_KEY, [])
  return Array.isArray(raw)
    ? raw.filter((i) => i && typeof i.product_id === 'string' && Number.isInteger(i.qty) && i.qty > 0)
    : []
}

export function CartProvider({ children }) {
  const [stored, setStored] = useState(loadStored)
  const [products, setProducts] = useState(() => new Map())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => writeJSON(STORAGE_KEY, stored), [stored])

  // Hidrata los productos del carrito desde el catálogo.
  const idsKey = stored.map((i) => i.product_id).join(',')
  useEffect(() => {
    let alive = true
    getProductsByIds(idsKey ? idsKey.split(',') : []).then((list) => {
      if (alive) setProducts(new Map(list.map((p) => [p.id, p])))
    })
    return () => {
      alive = false
    }
  }, [idsKey])

  // Líneas válidas: el producto existe y tiene existencia; la cantidad nunca pasa del stock.
  const lines = useMemo(() => stored
    .map(({ product_id, qty }) => {
      const product = products.get(product_id)
      if (!product || product.stock <= 0) return null
      const q = Math.min(qty, product.stock)
      return { product, qty: q, total: product.price * q }
    })
    .filter(Boolean), [stored, products])

  const add = useCallback((product, qty = 1) => {
    setProducts((m) => (m.has(product.id) ? m : new Map(m).set(product.id, product)))
    setStored((items) => {
      const current = items.find((i) => i.product_id === product.id)
      const nextQty = Math.min((current?.qty ?? 0) + qty, product.stock)
      if (nextQty <= 0) return items
      return current
        ? items.map((i) => (i.product_id === product.id ? { ...i, qty: nextQty } : i))
        : [...items, { product_id: product.id, qty: nextQty }]
    })
    setDrawerOpen(true)
  }, [])

  const setQty = useCallback((productId, qty) => {
    setStored((items) => items.map((i) => (i.product_id === productId ? { ...i, qty: Math.max(1, qty) } : i)))
  }, [])

  const remove = useCallback((productId) => {
    setStored((items) => items.filter((i) => i.product_id !== productId))
  }, [])

  const clear = useCallback(() => setStored([]), [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.total, 0),
    add,
    setQty,
    remove,
    clear,
    drawerOpen,
    openDrawer,
    closeDrawer,
  }), [lines, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}
