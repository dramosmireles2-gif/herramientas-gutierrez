import { useMemo } from 'react'
import { useAdmin } from '../store/AdminStore'

/** Select nativo de productos agrupado por categoría (en celular abre el selector del sistema). */
export default function SelectorProducto({ id, valor, onCambiar, filtro = () => true, vacio = 'Elige un producto', invalido, describedBy }) {
  const { datos } = useAdmin()
  const grupos = useMemo(() => datos.categorias
    .map((c) => ({
      ...c,
      productos: datos.productos
        .filter((p) => p.categoria_id === c.id && p.activo && filtro(p))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    }))
    .filter((g) => g.productos.length), [datos.categorias, datos.productos, filtro])

  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      aria-invalid={invalido || undefined}
      aria-describedby={describedBy}
      className={`h-12 w-full rounded-lg border bg-blanco px-3 ${invalido ? 'border-agotado' : 'border-gris/40'}`}
    >
      <option value="">{vacio}</option>
      {grupos.map((g) => (
        <optgroup key={g.id} label={g.nombre}>
          {g.productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.sku}</option>)}
        </optgroup>
      ))}
    </select>
  )
}
