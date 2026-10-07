import Encabezado from './Encabezado'

/** Pantalla en construcción: título y lo que va a tener (Fase 1 del plan). */
export default function PaginaEsqueleto({ titulo, descripcion, contenido = [], fase, children }) {
  return (
    <>
      <Encabezado titulo={titulo} descripcion={descripcion} />
      {children}
      <section className="rounded-xl border-2 border-dashed border-titanio/15 bg-blanco p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-hielo-texto">En construcción{fase ? ` · fase ${fase}` : ''}</p>
        {contenido.length > 0 && (
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gris">
            {contenido.map((c) => <li key={c}>{c}</li>)}
          </ul>
        )}
      </section>
    </>
  )
}
