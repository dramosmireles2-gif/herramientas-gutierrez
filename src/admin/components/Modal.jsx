import { useEffect, useRef } from 'react'
import { XIcon } from '../../components/icons'

/**
 * Ventana modal del panel: hoja inferior en móvil, centrada en escritorio.
 * Esc o el fondo la cierran; el foco entra al abrir y regresa al cerrar.
 */
export default function Modal({ abierto, titulo, onCerrar, children, pie, ancho = 'max-w-lg' }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // Enfoca el primer campo; si no hay, el panel.
    const primero = panel.current?.querySelector('input, select, textarea')
    ;(primero ?? panel.current)?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previo?.focus?.()
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-titanio/70" onClick={onCerrar} aria-hidden="true" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-blanco text-texto shadow-xl outline-none sm:rounded-2xl ${ancho}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-fondo px-5 py-3">
          <h2 id="modal-titulo" className="text-2xl uppercase text-titanio">{titulo}</h2>
          <button type="button" onClick={onCerrar} className="flex h-11 w-11 items-center justify-center rounded-full text-gris hover:bg-fondo" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie && <div className="border-t border-fondo px-5 py-3">{pie}</div>}
      </div>
    </div>
  )
}
