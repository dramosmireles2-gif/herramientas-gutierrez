import { Link } from 'react-router-dom'

// Logo provisional: tuerca hexagonal hielo con centro titanio. El cliente aún no tiene logo.
export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Herramientas Gutiérrez, ir al inicio">
      <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <polygon points="16,1.5 28.6,8.75 28.6,23.25 16,30.5 3.4,23.25 3.4,8.75" fill="var(--c-hielo)" />
        <circle cx="16" cy="16" r="6.5" fill="var(--c-titanio)" />
      </svg>
      <span className="font-condensed uppercase leading-[0.9] text-blanco">
        <span className="block text-[0.8rem] tracking-wide">Herramientas</span>
        <span className="block text-xl tracking-tight">Gutiérrez</span>
      </span>
    </Link>
  )
}
