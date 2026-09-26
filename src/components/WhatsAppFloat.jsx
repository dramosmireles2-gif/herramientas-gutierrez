import { WhatsAppIcon } from './icons'

// href lo arma services/whatsapp.js con el número de la sucursal de contacto.
export default function WhatsAppFloat({ href = null, raised = false }) {
  const position = raised ? 'bottom-24 lg:bottom-5' : 'bottom-5'
  const common = `fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-cta-ink shadow-lg transition-transform hover:scale-105 sm:right-5 ${position}`

  if (!href) {
    return (
      <span className={`${common} opacity-60`} role="img" aria-label="WhatsApp disponible al elegir sucursal">
        <WhatsAppIcon width={30} height={30} />
      </span>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={common} aria-label="Escríbenos por WhatsApp">
      <WhatsAppIcon width={30} height={30} />
    </a>
  )
}
