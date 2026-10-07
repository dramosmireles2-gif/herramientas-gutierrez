import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import SoloAdmin from '../../components/SoloAdmin'
import { IconoExcel, IconoMovimientos } from '../../components/iconos'
import { CheckIcon, XIcon } from '../../../components/icons'
import { leerExcel } from '../../utils/excel'
import { descargarArchivoDePrueba, descargarPlantilla, exportarProductos } from '../../utils/exportaciones'
import { diferenciasExistencia, validarImportacion } from '../../utils/importacion'
import { formatoMoneda } from '../../utils/formato'

function Tarjeta({ titulo, descripcion, children }) {
  return (
    <section className="flex flex-col rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
      <h2 className="text-xl uppercase text-titanio">{titulo}</h2>
      <p className="mt-1 flex-1 text-sm text-gris">{descripcion}</p>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </section>
  )
}

const boton = 'btn h-11 bg-blanco text-sm text-titanio ring-1 ring-titanio/15 hover:bg-fondo'

/** Resumen de lo que cambia una fila válida (precio, datos, existencias). */
function Cambios({ r, datos }) {
  const nombre = (id) => datos.sucursales.find((s) => s.id === id)?.nombre ?? id
  const partes = []
  if (r.accion === 'actualizar') {
    if (r.cambios.precio != null && r.cambios.precio !== r.producto.precio) partes.push(`Precio ${formatoMoneda(r.producto.precio)} → ${formatoMoneda(r.cambios.precio)}`)
    if (r.cambios.precio_oferta != null && r.cambios.precio_oferta !== r.producto.precio_oferta) partes.push(`Oferta ${formatoMoneda(r.cambios.precio_oferta)}`)
  } else {
    partes.push(`${formatoMoneda(r.cambios.precio)}`)
  }
  for (const d of diferenciasExistencia(r, datos.inventario)) partes.push(`${nombre(d.sucursal_id)} ${d.antes} → ${d.despues}`)
  if (!partes.length) partes.push(r.accion === 'actualizar' ? 'Datos generales' : 'Sin existencias')
  return <span className="text-gris">{partes.join(' · ')}</span>
}

function Importar() {
  const { datos, importarProductos } = useAdmin()
  const avisar = useAvisos()
  const input = useRef(null)
  const [archivo, setArchivo] = useState(null)
  const [resultado, setResultado] = useState(null) // { resultados, errorGeneral }
  const [leyendo, setLeyendo] = useState(false)
  const [soloErrores, setSoloErrores] = useState(false)

  const elegir = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setLeyendo(true)
    setArchivo(f.name)
    setSoloErrores(false)
    try {
      setResultado(validarImportacion(await leerExcel(f), datos))
    } catch (err) {
      setResultado({ errorGeneral: err.message, resultados: [] })
    } finally {
      setLeyendo(false)
    }
  }

  const validas = resultado?.resultados.filter((r) => !r.errores.length) ?? []
  const conError = resultado?.resultados.filter((r) => r.errores.length) ?? []
  const nuevos = validas.filter((r) => r.accion === 'nuevo').length

  const confirmar = () => {
    const r = importarProductos(validas, archivo)
    if (!r.ok) return avisar(r.error, 'error')
    avisar(`Importación lista: ${r.creados} nuevos, ${r.actualizados} actualizados y ${r.ajustes} ajustes de existencia registrados en Movimientos.`)
    setResultado(null)
    setArchivo(null)
  }
  const cancelar = () => {
    setResultado(null)
    setArchivo(null)
  }

  const filas = soloErrores ? conError : resultado?.resultados ?? []

  return (
    <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
      <h2 className="text-xl uppercase text-titanio">Importar productos</h2>
      <p className="mt-1 text-sm text-gris">Sube la plantilla llena. Antes de guardar verás qué filas están bien y cuáles tienen errores.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={leyendo} className="btn-primary h-11">
          <IconoExcel width={20} height={20} /> {leyendo ? 'Leyendo…' : resultado ? 'Subir otro archivo' : 'Subir archivo de Excel'}
        </button>
        <input ref={input} type="file" accept=".xlsx,.xls,.csv" onChange={elegir} className="sr-only" tabIndex={-1} aria-hidden="true" />
        {archivo && <span className="text-sm text-gris">{archivo}</span>}
      </div>

      {resultado?.errorGeneral && (
        <p role="alert" className="mt-4 rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{resultado.errorGeneral}</p>
      )}

      {resultado && !resultado.errorGeneral && (
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2" aria-live="polite">
            <Insignia tono="ok"><CheckIcon width={12} height={12} strokeWidth={3} /> {validas.length - nuevos} actualizan</Insignia>
            <Insignia tono="ok"><CheckIcon width={12} height={12} strokeWidth={3} /> {nuevos} nuevos</Insignia>
            <Insignia tono={conError.length ? 'agotado' : 'neutro'}><XIcon width={12} height={12} strokeWidth={3} /> {conError.length} con error</Insignia>
            {conError.length > 0 && (
              <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={soloErrores} onChange={(e) => setSoloErrores(e.target.checked)} className="h-4 w-4 accent-agotado" />
                Ver solo errores
              </label>
            )}
          </div>

          <ul className="mt-3 max-h-[28rem] divide-y divide-fondo overflow-y-auto rounded-lg ring-1 ring-titanio/10">
            {filas.map((r) => {
              const ok = !r.errores.length
              return (
                <li key={r.fila} className={`flex gap-3 px-3 py-2.5 text-sm ${ok ? 'bg-ok/5' : 'bg-agotado/5'}`}>
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-ok text-blanco' : 'bg-agotado text-blanco'}`} role="img" aria-label={ok ? 'Correcta' : 'Con error'}>
                    {ok ? <CheckIcon width={12} height={12} strokeWidth={3} /> : <XIcon width={12} height={12} strokeWidth={3} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-xs text-gris">Fila {r.fila}</span>
                      <span className="font-mono text-xs font-bold">{r.sku || '(sin SKU)'}</span>
                      <span className="font-semibold">{r.nombre}</span>
                      <Insignia tono={r.accion === 'nuevo' ? 'info' : 'neutro'}>{r.accion === 'nuevo' ? 'Nuevo' : 'Actualiza'}</Insignia>
                    </p>
                    {ok ? <p className="mt-0.5"><Cambios r={r} datos={datos} /></p> : (
                      <ul className="mt-0.5 font-semibold text-agotado">{r.errores.map((e) => <li key={e}>{e}</li>)}</ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="button" onClick={confirmar} disabled={!validas.length} className="btn-primary h-12">
              Confirmar importación ({validas.length} {validas.length === 1 ? 'fila' : 'filas'})
            </button>
            <button type="button" onClick={cancelar} className="btn h-12 text-titanio ring-1 ring-titanio/15 hover:bg-fondo">Cancelar</button>
            {conError.length > 0 && <p className="text-sm text-gris sm:ml-2">Las {conError.length} filas con error no se importan. Corrígelas en el archivo y vuelve a subirlo.</p>}
          </div>
        </div>
      )}
    </section>
  )
}

export default function ImportarExportar() {
  const { datos } = useAdmin()
  const avisar = useAvisos()
  const descargar = (fn, texto) => async () => {
    try {
      await fn(datos)
      avisar(texto)
    } catch {
      avisar('No se pudo generar el archivo.', 'error')
    }
  }

  return (
    <SoloAdmin titulo="Importar / Exportar">
      <Encabezado titulo="Importar / Exportar" descripcion="Carga y descarga tu catálogo e inventario en Excel." />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Tarjeta titulo="Plantilla" descripcion="Archivo con las columnas correctas y una hoja de instrucciones. Una fila por producto; las existencias van por sucursal.">
          <button type="button" onClick={descargar(descargarPlantilla, 'Plantilla descargada.')} className={boton}><IconoExcel width={18} height={18} /> Descargar plantilla</button>
          <button type="button" onClick={descargar(descargarArchivoDePrueba, 'Archivo de prueba descargado: súbelo abajo para ver la validación.')} className="btn h-11 text-sm text-hielo-texto hover:underline">
            Archivo de prueba
          </button>
        </Tarjeta>
        <Tarjeta titulo="Exportar productos" descripcion={`Los ${datos.productos.length} productos con precios y existencia por sucursal, en el mismo formato de la plantilla: puedes editarlo y volver a subirlo.`}>
          <button type="button" onClick={descargar(exportarProductos, 'Productos exportados.')} className={boton}><IconoExcel width={18} height={18} /> Exportar productos</button>
        </Tarjeta>
        <Tarjeta titulo="Exportar movimientos" descripcion="El historial de entradas, ventas, ajustes y traspasos. Filtra por fechas, sucursal o tipo y exporta lo que ves.">
          <Link to="/admin/movimientos" className={boton}><IconoMovimientos width={18} height={18} /> Ir a Movimientos</Link>
        </Tarjeta>
      </div>

      <Importar />
    </SoloAdmin>
  )
}
