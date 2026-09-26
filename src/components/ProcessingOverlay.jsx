import { ShieldIcon } from './icons'

/** Pantalla de "procesando pago" mientras responde la pasarela (simulada en el demo). */
export default function ProcessingOverlay({ total }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-titanio px-6 text-center text-blanco" role="alertdialog" aria-modal="true" aria-labelledby="processing-title" aria-describedby="processing-desc">
      <span className="h-16 w-16 animate-spin rounded-full border-4 border-blanco/20 border-t-hielo" aria-hidden="true" />
      <h2 id="processing-title" className="mt-6 text-4xl uppercase">Procesando tu pago</h2>
      <p id="processing-desc" className="mt-2 max-w-sm text-blanco/80" aria-live="polite">
        Estamos confirmando tu pago de <strong className="price text-blanco">{total}</strong>. No cierres esta ventana.
      </p>
      <p className="mt-8 flex items-center gap-2 text-sm text-blanco/70">
        <ShieldIcon width={18} height={18} /> Pago simulado para el demo: no se hace ningún cargo.
      </p>
    </div>
  )
}
