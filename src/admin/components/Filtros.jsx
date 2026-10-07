import { SearchIcon } from '../../components/icons'

// Controles de filtro del panel: misma altura y estilo en todas las pantallas.
const control = 'h-11 w-full rounded-lg border border-gris/40 bg-blanco px-3 text-sm'

export function CampoBusqueda({ id, valor, onCambiar, placeholder, etiqueta = 'Buscar' }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{etiqueta}</label>
      <SearchIcon width={18} height={18} className="pointer-events-none absolute left-3 top-3.5 text-gris" />
      <input id={id} type="search" value={valor} onChange={(e) => onCambiar(e.target.value)} placeholder={placeholder} className={`${control} pl-10`} />
    </div>
  )
}

export function FiltroSelect({ id, etiqueta, valor, onCambiar, opciones }) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{etiqueta}</label>
      <select id={id} value={valor} onChange={(e) => onCambiar(e.target.value)} className={`${control} font-semibold text-titanio`}>
        {opciones.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
      </select>
    </div>
  )
}

export function FiltroFecha({ id, etiqueta, valor, onCambiar }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-gris">{etiqueta}</label>
      <input id={id} type="date" value={valor} onChange={(e) => onCambiar(e.target.value)} className={control} />
    </div>
  )
}

/** Filtros guardados en la URL (?q=…&categoria=…): sobreviven al volver atrás desde una ficha. */
export function leerFiltros(params, claves) {
  return Object.fromEntries(claves.map((k) => [k, params.get(k) ?? '']))
}
export function escribirFiltro(params, setParams, clave, valor) {
  const siguiente = new URLSearchParams(params)
  valor ? siguiente.set(clave, valor) : siguiente.delete(clave)
  setParams(siguiente, { replace: true })
}
