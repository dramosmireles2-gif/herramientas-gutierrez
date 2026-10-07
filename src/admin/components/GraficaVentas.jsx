import { useEffect, useRef, useState } from 'react'
import { formatoMoneda } from '../utils/formato'

// Gráfica de columnas de una sola serie (ventas por día). Specs de la guía de visualización:
// columnas ≤24 px con 4 px redondeados arriba y base recta, 2 px de aire entre columnas,
// cuadrícula de 1 px tenue, sin leyenda (una sola serie: el título la nombra),
// tooltip al pasar el cursor o con flechas del teclado, y tabla con todos los valores.
// Color: #0284C7 (token hielo-hover) — validado ≥3:1 contra la tarjeta blanca; el hielo base no alcanza.
const COLOR = '#0284C7'
const COLOR_ACTIVO = '#0EA5E9'
const REJILLA = '#E4E9EE'
const ALTO = 220
const M = { arriba: 12, derecha: 8, abajo: 26, izquierda: 52 }

const compacto = new Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 })
const diaCorto = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' })
const diaLargo = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

/** Máximo "redondo" para el eje (1, 2, 2.5 o 5 × potencia de 10) y sus marcas. */
function escala(max) {
  if (max <= 0) return { tope: 100000, marcas: [0, 25000, 50000, 75000, 100000] }
  const bruto = max / 4
  const potencia = 10 ** Math.floor(Math.log10(bruto))
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * potencia).find((p) => p >= bruto)
  const tope = Math.ceil(max / paso) * paso
  return { tope, marcas: Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso) }
}

// Columna con esquinas superiores de 4 px y base recta.
function columna(x, y, ancho, alto) {
  const r = Math.min(4, alto, ancho / 2)
  if (alto <= 0) return ''
  return `M${x},${y + alto}V${y + r}Q${x},${y} ${x + r},${y}H${x + ancho - r}Q${x + ancho},${y} ${x + ancho},${y + r}V${y + alto}Z`
}

export default function GraficaVentas({ serie, titulo = 'Ventas por día' }) {
  const contenedor = useRef(null)
  const [ancho, setAncho] = useState(0) // 0 = aún sin medir: no se dibuja hasta conocer el espacio real
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setAncho(Math.floor(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const w = ancho - M.izquierda - M.derecha
  const h = ALTO - M.arriba - M.abajo
  const { tope, marcas } = escala(Math.max(...serie.map((d) => d.total)))
  const banda = w / serie.length
  const anchoBarra = Math.max(2, Math.min(24, banda - 2)) // ≤24 px y al menos 2 px de aire
  const yDe = (v) => M.arriba + h - (v / tope) * h
  const cadaCuanto = ancho < 480 ? 7 : 5 // etiquetas del eje X espaciadas

  const indiceDesdePuntero = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const i = Math.floor((e.clientX - rect.left - M.izquierda) / banda)
    return i >= 0 && i < serie.length ? i : null
  }
  const teclado = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    setActivo((i) => {
      const actual = i ?? serie.length - 1
      if (e.key === 'Home') return 0
      if (e.key === 'End') return serie.length - 1
      return Math.min(serie.length - 1, Math.max(0, actual + (e.key === 'ArrowRight' ? 1 : -1)))
    })
  }

  const total = serie.reduce((n, d) => n + d.total, 0)
  const mejor = serie.reduce((a, d) => (d.total > a.total ? d : a), serie[0])
  const d = activo != null ? serie[activo] : null
  const xTooltip = activo != null ? M.izquierda + activo * banda + banda / 2 : 0

  return (
    <figure className="m-0">
      <figcaption className="mb-3">
        <span className="block text-sm font-bold text-titanio">{titulo}</span>
        <span className="block text-xs text-gris">Últimos {serie.length} días · {formatoMoneda(total)} en total</span>
      </figcaption>

      <div ref={contenedor} className="relative" style={{ minHeight: ALTO }}>
        {ancho > 0 && <svg
          width={ancho}
          height={ALTO}
          role="img"
          aria-label={`${titulo}: ${formatoMoneda(total)} en ${serie.length} días. Mejor día ${diaLargo.format(mejor.fecha)} con ${formatoMoneda(mejor.total)}. Usa las flechas para recorrer los días.`}
          tabIndex={0}
          onPointerMove={(e) => setActivo(indiceDesdePuntero(e))}
          onPointerLeave={() => setActivo(null)}
          onKeyDown={teclado}
          onBlur={() => setActivo(null)}
          className="block touch-pan-y outline-none focus-visible:rounded-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-hielo-texto"
        >
          {marcas.map((m) => (
            <g key={m}>
              <line x1={M.izquierda} x2={ancho - M.derecha} y1={yDe(m)} y2={yDe(m)} stroke={REJILLA} strokeWidth="1" shapeRendering="crispEdges" />
              <text x={M.izquierda - 8} y={yDe(m)} dy="0.32em" textAnchor="end" className="fill-gris text-[11px] tabular-nums">
                {m === 0 ? '$0' : `$${compacto.format(m / 100)}`}
              </text>
            </g>
          ))}
          {serie.map((p, i) => {
            const x = M.izquierda + i * banda + (banda - anchoBarra) / 2
            const y = yDe(p.total)
            return <path key={p.dia} d={columna(x, y, anchoBarra, M.arriba + h - y)} fill={i === activo ? COLOR_ACTIVO : COLOR} />
          })}
          {serie.map((p, i) =>
            (serie.length - 1 - i) % cadaCuanto === 0 ? (
              // La última etiqueta se alinea a la derecha para que no se corte en el borde.
              <text
                key={p.dia}
                x={i === serie.length - 1 ? ancho - M.derecha : M.izquierda + i * banda + banda / 2}
                y={ALTO - 8}
                textAnchor={i === serie.length - 1 ? 'end' : 'middle'}
                className="fill-gris text-[11px]"
              >
                {diaCorto.format(p.fecha)}
              </text>
            ) : null,
          )}
        </svg>}

        {d && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-titanio px-3 py-2 text-blanco shadow-lg"
            style={{ left: Math.min(Math.max(xTooltip, 70), ancho - 70) }}
          >
            <span className="block font-condensed text-lg leading-tight">{formatoMoneda(d.total)}</span>
            <span className="block text-xs text-blanco/80">{diaLargo.format(d.fecha)}</span>
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold text-hielo-texto">Ver datos en tabla</summary>
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg ring-1 ring-titanio/10">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-blanco text-xs uppercase tracking-wide text-gris">
              <tr><th scope="col" className="px-3 py-2 text-left">Día</th><th scope="col" className="px-3 py-2 text-right">Ventas</th></tr>
            </thead>
            <tbody className="divide-y divide-fondo">
              {[...serie].reverse().map((p) => (
                <tr key={p.dia}><td className="px-3 py-1.5">{diaLargo.format(p.fecha)}</td><td className="px-3 py-1.5 text-right tabular-nums">{formatoMoneda(p.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
