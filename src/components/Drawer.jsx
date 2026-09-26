import { useEffect, useRef } from 'react'
import { XIcon } from './icons'

/** Panel lateral modal (filtros en móvil, carrito). Cierra con Esc o tocando el fondo. */
export default function Drawer({ open, onClose, title, side = 'left', footer, children }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-titanio/60" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`absolute inset-y-0 flex w-[88%] max-w-sm flex-col bg-blanco shadow-xl outline-none ${side === 'left' ? 'left-0' : 'right-0'}`}
      >
        <div className="flex items-center justify-between border-b border-fondo px-4 py-3">
          <h2 className="text-2xl uppercase text-titanio">{title}</h2>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-fondo" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="border-t border-fondo p-4">{footer}</div>}
      </div>
    </div>
  )
}
