import { useBranch } from '../context/BranchContext'

/**
 * Enlace a WhatsApp de la sucursal elegida. buildUrl(branch) arma el wa.me;
 * si aún no hay sucursal, el mismo botón abre el selector.
 */
export default function WhatsAppLink({ buildUrl, className, children }) {
  const { branch, openPicker } = useBranch()
  const href = branch ? buildUrl(branch) : null

  if (!href) {
    return (
      <button type="button" onClick={openPicker} className={className}>
        {children}
      </button>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
