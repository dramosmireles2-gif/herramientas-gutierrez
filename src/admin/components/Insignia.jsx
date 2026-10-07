// Etiquetas de estado del panel. Los colores ok/agotado son solo para existencias (regla de la paleta).
const TONOS = {
  ok: 'bg-ok/10 text-ok',
  agotado: 'bg-agotado/10 text-agotado',
  bajo: 'bg-agotado/10 text-agotado',
  info: 'bg-hielo/15 text-hielo-texto',
  neutro: 'bg-fondo text-gris',
  oscuro: 'bg-titanio text-blanco',
}

export default function Insignia({ tono = 'neutro', children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${TONOS[tono]} ${className}`}>
      {children}
    </span>
  )
}

const ESTADOS_EXISTENCIA = {
  agotado: { tono: 'agotado', texto: 'Agotado' },
  bajo: { tono: 'bajo', texto: 'Existencia baja' },
  ok: { tono: 'ok', texto: 'En existencia' },
}

/** Insignia de existencia: 'agotado' | 'bajo' | 'ok' */
export function InsigniaExistencia({ estado }) {
  const e = ESTADOS_EXISTENCIA[estado] ?? ESTADOS_EXISTENCIA.ok
  return <Insignia tono={e.tono}>{e.texto}</Insignia>
}
