import { useEffect, useState } from 'react'
import { CheckIcon } from './icons'

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-b border-fondo py-4 first:pt-0">
      <legend className="mb-3 font-condensed text-lg uppercase text-titanio">{title}</legend>
      {children}
    </fieldset>
  )
}

function CheckRow({ id, checked, onChange, label, count }) {
  return (
    <label htmlFor={id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-1 hover:bg-fondo">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-gris bg-blanco text-cta-ink peer-checked:border-hielo peer-checked:bg-hielo peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-hielo-texto"
        aria-hidden="true"
      >
        {checked && <CheckIcon width={14} height={14} strokeWidth={3} />}
      </span>
      <span className="flex-1 text-sm">{label}</span>
      {count != null && <span className="text-xs text-gris">{count}</span>}
    </label>
  )
}

function PriceFilter({ min, max, range, onApply, idPrefix }) {
  const [lo, setLo] = useState(min ?? '')
  const [hi, setHi] = useState(max ?? '')
  useEffect(() => { setLo(min ?? ''); setHi(max ?? '') }, [min, max])

  const submit = (e) => {
    e.preventDefault()
    const toNum = (v) => (v === '' ? undefined : Math.max(0, Math.round(Number(v))))
    let a = toNum(lo), b = toNum(hi)
    if (a != null && b != null && a > b) [a, b] = [b, a]
    onApply(a, b)
  }

  return (
    <form onSubmit={submit} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor={`${idPrefix}-min`} className="mb-1 block text-xs text-gris">Mínimo</label>
        <input
          id={`${idPrefix}-min`} type="number" inputMode="numeric" min="0" value={lo}
          onChange={(e) => setLo(e.target.value)} placeholder={`$${range?.min.toLocaleString('es-MX') ?? ''}`}
          className="h-10 w-full rounded-md border border-gris/40 px-2 text-sm"
        />
      </div>
      <div className="flex-1">
        <label htmlFor={`${idPrefix}-max`} className="mb-1 block text-xs text-gris">Máximo</label>
        <input
          id={`${idPrefix}-max`} type="number" inputMode="numeric" min="0" value={hi}
          onChange={(e) => setHi(e.target.value)} placeholder={`$${range?.max.toLocaleString('es-MX') ?? ''}`}
          className="h-10 w-full rounded-md border border-gris/40 px-2 text-sm"
        />
      </div>
      <button type="submit" className="h-10 rounded-md bg-titanio px-3 text-sm font-bold text-blanco hover:bg-texto">Aplicar</button>
    </form>
  )
}

/** Filtros del catálogo. Se usa en la barra lateral (escritorio) y dentro del Drawer (móvil). */
export default function CatalogFilters({ filters, categories, brands, priceRange, onToggle, onPrice, onInStock, idPrefix = 'f' }) {
  return (
    <div>
      <FilterGroup title="Existencia">
        <CheckRow id={`${idPrefix}-stock`} checked={filters.inStock} onChange={() => onInStock(!filters.inStock)} label="Solo en existencia" />
      </FilterGroup>

      <FilterGroup title="Categoría">
        {categories?.map((c) => (
          <CheckRow
            key={c.id} id={`${idPrefix}-cat-${c.slug}`} label={c.name} count={c.count}
            checked={filters.category.includes(c.slug)} onChange={() => onToggle('categoria', c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Precio">
        <PriceFilter min={filters.minPrice} max={filters.maxPrice} range={priceRange} onApply={onPrice} idPrefix={idPrefix} />
      </FilterGroup>

      <FilterGroup title="Marca">
        {brands?.map((b) => (
          <CheckRow
            key={b.id} id={`${idPrefix}-brand-${b.slug}`} label={b.name} count={b.count}
            checked={filters.brand.includes(b.slug)} onChange={() => onToggle('marca', b.slug)}
          />
        ))}
      </FilterGroup>
    </div>
  )
}
