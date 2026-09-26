import { useEffect, useRef } from 'react'
import { useBranch } from '../context/BranchContext'
import { CheckIcon, PinIcon, XIcon } from './icons'

/** Modal para elegir sucursal. Se abre solo al primer ingreso y desde el chip del header. */
export default function BranchPicker() {
  const { branches, branch, selectBranch, pickerOpen, closePicker } = useBranch()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return
    const previous = document.activeElement
    const onKey = (e) => e.key === 'Escape' && closePicker()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [pickerOpen, closePicker])

  if (!pickerOpen || !branches.length) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-titanio/70" onClick={closePicker} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-title"
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-blanco p-5 shadow-xl outline-none sm:rounded-2xl sm:p-6"
      >
        <button
          type="button"
          onClick={closePicker}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-gris hover:bg-fondo"
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fondo text-hielo-texto">
          <PinIcon />
        </span>
        <h2 id="branch-title" className="mt-3 text-3xl uppercase text-titanio">¿Cuál es tu sucursal?</h2>
        <p className="mt-1 text-gris">Ahí recoges tu pedido y te atienden por WhatsApp. Puedes cambiarla cuando quieras.</p>

        <ul className="mt-5 space-y-2">
          {branches.map((b) => {
            const selected = branch?.id === b.id
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => selectBranch(b.id)}
                  aria-pressed={selected}
                  className={`flex w-full items-center gap-3 rounded-xl p-4 text-left ring-2 transition ${selected ? 'bg-hielo/10 ring-hielo' : 'bg-fondo ring-transparent hover:ring-titanio/20'}`}
                >
                  <PinIcon width={20} height={20} className="shrink-0 text-hielo-texto" />
                  <span className="flex-1">
                    <span className="block font-bold text-titanio">{b.city}</span>
                    <span className="block text-sm text-gris">{b.state} · {b.address}</span>
                  </span>
                  {selected && <CheckIcon className="shrink-0 text-hielo-texto" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
