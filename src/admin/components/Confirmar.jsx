import { useEffect, useRef } from 'react'

/** Diálogo de confirmación accesible (Esc o el fondo cancelan; el foco va a "Cancelar"). */
export default function Confirmar({ abierto, titulo, mensaje, textoConfirmar = 'Confirmar', peligro = false, onConfirmar, onCancelar }) {
  const cancelarRef = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onCancelar()
    document.addEventListener('keydown', onKey)
    cancelarRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      previo?.focus?.()
    }
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-titanio/70" onClick={onCancelar} aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby="confirmar-mensaje"
        className="relative w-full max-w-md rounded-t-2xl bg-blanco p-6 text-texto shadow-xl sm:rounded-2xl"
      >
        <h2 id="confirmar-titulo" className="text-2xl uppercase text-titanio">{titulo}</h2>
        <p id="confirmar-mensaje" className="mt-2 text-sm text-gris">{mensaje}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelarRef} type="button" onClick={onCancelar} className="btn border border-titanio/20 text-titanio hover:bg-fondo">
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} className={peligro ? 'btn bg-agotado text-blanco hover:opacity-90' : 'btn-primary'}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
