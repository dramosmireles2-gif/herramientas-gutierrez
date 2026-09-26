import { WhatsAppIcon } from './icons'

// href lo arma services/whatsapp.js con el número de la sucursal elegida.
// Sin sucursal, el botón abre el selector para saber a quién escribir.
export default function WhatsAppFloat({ href = null, onNeedBranch, raised = false }) {
  const position = raised ? 'bottom-24 lg:bottom-5' : 'bottom-5'
  const className = `fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-cta-ink shadow-lg transition-transform hover:scale-105 sm:right-5 ${position}`

  if (!href) {
    return (
      <button type="button" onClick={onNeedBranch} className={className} aria-label="Escríbenos por WhatsApp (elige tu sucursal)">
        <WhatsAppIcon width={30} height={30} />
      </button>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label="Escríbenos por WhatsApp">
      <WhatsAppIcon width={30} height={30} />
    </a>
  )
}
