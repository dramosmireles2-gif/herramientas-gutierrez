import { usePageMeta } from '../../hooks/usePageMeta'

/** Título de cada pantalla del panel (y título de la pestaña del navegador). */
export default function Encabezado({ titulo, descripcion, acciones }) {
  usePageMeta(`${titulo} · Panel`)
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl uppercase leading-none text-titanio md:text-5xl">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-2xl text-gris">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  )
}
