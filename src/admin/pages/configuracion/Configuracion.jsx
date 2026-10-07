import { useState } from 'react'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import SoloAdmin from '../../components/SoloAdmin'
import { formatoMoneda } from '../../utils/formato'
import { cotizarEnvio, etiquetaRango } from '../../utils/envios'

const campo = 'h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3'
const aPesos = (c) => String(c / 100)
const aCentavos = (p) => Math.round(Number(p) * 100)

function Seccion({ titulo, descripcion, children }) {
  return (
    <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6">
      <h2 className="text-xl uppercase text-titanio">{titulo}</h2>
      {descripcion && <p className="mt-1 text-sm text-gris">{descripcion}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DatosTienda() {
  const { datos, guardarConfiguracion } = useAdmin()
  const avisar = useAvisos()
  const [f, setF] = useState(datos.configuracion.tienda)
  const guardar = (e) => {
    e.preventDefault()
    const r = guardarConfiguracion({ tienda: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v.trim()])) })
    r.ok ? avisar('Datos de la tienda guardados.') : avisar(r.error, 'error')
  }
  return (
    <Seccion titulo="Datos de la tienda" descripcion="Aparecen en la tienda en línea, los correos y los comprobantes.">
      <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
        {[['nombre', 'Nombre comercial', 'text'], ['telefono', 'Teléfono', 'tel'], ['correo', 'Correo de contacto', 'text'], ['sitio', 'Sitio web', 'url']].map(([k, t, tipo]) => (
          <div key={k}>
            <label htmlFor={`cfg-${k}`} className="mb-1 block text-sm font-semibold text-titanio">{t}</label>
            <input id={`cfg-${k}`} type={tipo} value={f[k]} onChange={(e) => setF((x) => ({ ...x, [k]: e.target.value }))} maxLength={120} className={campo} />
          </div>
        ))}
        <div className="sm:col-span-2"><button type="submit" className="btn-primary h-11">Guardar datos</button></div>
      </form>
    </Seccion>
  )
}

function Envios() {
  const { datos, guardarConfiguracion } = useAdmin()
  const avisar = useAvisos()
  const envios = datos.configuracion.envios
  // Edición en pesos (texto) para no pelear con el teclado; se convierte a centavos al guardar.
  const [gratis, setGratis] = useState(aPesos(envios.gratis_desde))
  const [tarifas, setTarifas] = useState(() => Object.fromEntries(Object.entries(envios.tarifas).map(([z, v]) => [z, v.map(aPesos)])))
  const [cot, setCot] = useState({ zona: 'regional', peso: '12', subtotal: '3500' })

  const tarifasCentavos = Object.fromEntries(Object.entries(tarifas).map(([z, v]) => [z, v.map(aCentavos)]))
  const invalido = !(Number(gratis) >= 0) || Object.values(tarifas).flat().some((v) => v === '' || !(Number(v) >= 0))

  const guardar = (e) => {
    e.preventDefault()
    if (invalido) return avisar('Revisa las tarifas: deben ser montos de 0 o más.', 'error')
    const r = guardarConfiguracion({ envios: { gratis_desde: aCentavos(gratis), tarifas: tarifasCentavos } })
    r.ok ? avisar('Tarifas de envío guardadas.') : avisar(r.error, 'error')
  }

  const resultado = Number(cot.peso) > 0
    ? cotizarEnvio({ ...envios, gratis_desde: aCentavos(gratis), tarifas: tarifasCentavos }, { zona: cot.zona, pesoKg: Number(cot.peso), subtotal: aCentavos(cot.subtotal || 0) })
    : null

  return (
    <Seccion titulo="Envíos" descripcion="Tarifas por zona y peso del paquete. Es la opción si tu paquetería no tiene conexión directa; en la versión final se puede cotizar por API.">
      <form onSubmit={guardar}>
        <div className="mb-4 sm:w-64">
          <label htmlFor="cfg-gratis" className="mb-1 block text-sm font-semibold text-titanio">Envío gratis desde (MXN)</label>
          <input id="cfg-gratis" type="number" min="0" step="1" inputMode="numeric" value={gratis} onChange={(e) => setGratis(e.target.value)} className={`${campo} price text-lg`} />
        </div>

        <div className="overflow-x-auto rounded-lg ring-1 ring-titanio/10">
          <table className="w-full text-sm">
            <caption className="sr-only">Tarifas de envío en pesos por zona y peso</caption>
            <thead className="bg-fondo text-xs uppercase tracking-wide text-gris">
              <tr>
                <th scope="col" className="px-3 py-2 text-left font-bold">Peso</th>
                {envios.zonas.map((z) => (
                  <th key={z.id} scope="col" className="px-3 py-2 text-left font-bold">
                    {z.nombre}
                    <span className="block text-[0.65rem] font-normal normal-case tracking-normal">{z.descripcion}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-fondo">
              {envios.rangos.map((_, i) => (
                <tr key={i}>
                  <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-semibold">{etiquetaRango(envios.rangos, i)}</th>
                  {envios.zonas.map((z) => (
                    <td key={z.id} className="px-2 py-1.5">
                      <label className="sr-only" htmlFor={`t-${z.id}-${i}`}>{z.nombre}, {etiquetaRango(envios.rangos, i)}</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2.5 top-2.5 text-gris">$</span>
                        <input
                          id={`t-${z.id}-${i}`}
                          type="number" min="0" step="1" inputMode="numeric"
                          value={tarifas[z.id][i]}
                          onChange={(e) => setTarifas((t) => ({ ...t, [z.id]: t[z.id].map((v, k) => (k === i ? e.target.value : v)) }))}
                          className="h-10 w-24 rounded-md border border-gris/40 pl-6 pr-2 tabular-nums"
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gris">Más de {envios.rangos.at(-1).hasta_kg} kg se cotiza aparte con la paquetería.</p>
        <button type="submit" className="btn-primary mt-4 h-11">Guardar tarifas</button>
      </form>

      {/* Calculadora para enseñar cómo se aplica la tabla */}
      <div className="mt-6 rounded-lg bg-fondo p-4">
        <h3 className="font-sans text-base font-bold text-titanio [font-stretch:normal]">Prueba la tabla</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="cot-zona" className="mb-1 block text-xs font-semibold text-gris">Zona</label>
            <select id="cot-zona" value={cot.zona} onChange={(e) => setCot((c) => ({ ...c, zona: e.target.value }))} className="h-11 w-full rounded-lg border border-gris/40 bg-blanco px-3">
              {envios.zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="cot-peso" className="mb-1 block text-xs font-semibold text-gris">Peso del paquete (kg)</label>
            <input id="cot-peso" type="number" min="0" step="0.1" inputMode="decimal" value={cot.peso} onChange={(e) => setCot((c) => ({ ...c, peso: e.target.value }))} className="h-11 w-full rounded-lg border border-gris/40 bg-blanco px-3" />
          </div>
          <div>
            <label htmlFor="cot-subtotal" className="mb-1 block text-xs font-semibold text-gris">Total de la compra (MXN)</label>
            <input id="cot-subtotal" type="number" min="0" step="1" inputMode="numeric" value={cot.subtotal} onChange={(e) => setCot((c) => ({ ...c, subtotal: e.target.value }))} className="h-11 w-full rounded-lg border border-gris/40 bg-blanco px-3" />
          </div>
        </div>
        <p className="mt-3 text-sm" aria-live="polite">
          {!resultado && 'Escribe el peso del paquete.'}
          {resultado?.tipo === 'gratis' && <>Envío <strong className="text-titanio">gratis</strong>: la compra es de {formatoMoneda(aCentavos(gratis))} o más.</>}
          {resultado?.tipo === 'tarifa' && <>Envío: <strong className="price text-xl text-titanio">{formatoMoneda(resultado.monto)}</strong> ({etiquetaRango(envios.rangos, resultado.rango).toLowerCase()}).</>}
          {resultado?.tipo === 'cotizar' && <>Pesa más de {envios.rangos.at(-1).hasta_kg} kg: <strong>se cotiza con la paquetería</strong>.</>}
        </p>
      </div>
    </Seccion>
  )
}

export default function Configuracion() {
  const { datos } = useAdmin()
  return (
    <SoloAdmin titulo="Configuración">
      <Encabezado titulo="Configuración" descripcion="Datos de la tienda, envíos y pagos." />
      <div className="space-y-5">
        <DatosTienda />
        <Envios />
        <Seccion titulo="Pagos">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-condensed text-2xl uppercase text-titanio">{datos.configuracion.pagos.proveedor}</span>
            <Insignia tono="info">Se conecta en la versión final</Insignia>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-gris">
            Pasarela de pago con tarjeta, OXXO y SPEI. En la versión final el cobro se confirma en el servidor y el pedido pasa a "pagado" solo cuando Openpay lo avisa.
            En el demo de la tienda el pago es simulado.
          </p>
        </Seccion>
      </div>
    </SoloAdmin>
  )
}
