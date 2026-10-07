import { useCallback, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import Encabezado from '../../components/Encabezado'
import SelectorProducto from '../../components/SelectorProducto'
import { PlusIcon, XIcon } from '../../../components/icons'
import { filaInventario } from '../../utils/existencias'

const campo = 'h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3'
let consecutivoRenglon = 0
const renglonVacio = () => ({ clave: ++consecutivoRenglon, producto_id: '', cantidad: '1' })

/** Crear traspaso: valida existencia en el origen y al enviar descuenta (traspaso_salida). */
export default function NuevoTraspaso() {
  const { datos, esAdmin, usuario, sucursalFiltro, ejecutar } = useAdmin()
  const avisar = useAvisos()
  const navigate = useNavigate()
  const sucursales = datos.sucursales.filter((s) => s.activa && s.tipo === 'sucursal')

  const [origen, setOrigen] = useState(esAdmin ? (sucursalFiltro !== 'todas' ? sucursalFiltro : '') : usuario.sucursal_id)
  const [destino, setDestino] = useState('')
  const [renglones, setRenglones] = useState([renglonVacio()])
  const [error, setError] = useState('')

  const disponible = (productoId) => (origen && productoId ? filaInventario(datos.inventario, productoId, origen)?.cantidad ?? 0 : 0)
  const conExistencia = useCallback((p) => p.tipo === 'inventariado' && origen && (filaInventario(datos.inventario, p.id, origen)?.cantidad ?? 0) > 0, [datos.inventario, origen])
  const cambiarRenglon = (clave, cambios) => setRenglones((rs) => rs.map((r) => (r.clave === clave ? { ...r, ...cambios } : r)))

  const enviar = (e) => {
    e.preventDefault()
    setError('')
    if (!origen) return setError('Elige la sucursal de origen.')
    if (!destino) return setError('Elige la sucursal de destino.')
    if (origen === destino) return setError('El origen y el destino deben ser distintos.')
    // Junta renglones repetidos del mismo producto.
    const items = []
    for (const r of renglones) {
      if (!r.producto_id) continue
      const cantidad = Number(r.cantidad)
      if (!Number.isInteger(cantidad) || cantidad <= 0) return setError('Las cantidades deben ser números enteros mayores que cero.')
      const previo = items.find((i) => i.producto_id === r.producto_id)
      previo ? (previo.cantidad += cantidad) : items.push({ producto_id: r.producto_id, cantidad })
    }
    if (!items.length) return setError('Agrega al menos un producto.')
    const sinExistencia = items.find((i) => i.cantidad > disponible(i.producto_id))
    if (sinExistencia) {
      const p = datos.productos.find((x) => x.id === sinExistencia.producto_id)
      return setError(`No hay suficiente "${p.nombre}" en el origen (hay ${disponible(sinExistencia.producto_id)}).`)
    }

    const numero = Math.max(0, ...datos.traspasos.map((t) => Number(t.folio.replace(/\D/g, '')) || 0)) + 1
    const folio = `TR-${String(numero).padStart(4, '0')}`
    const r = ejecutar({
      movimientos: items.map((i) => ({ producto_id: i.producto_id, sucursal_id: origen, tipo: 'traspaso_salida', cantidad: i.cantidad, referencia: folio })),
      cambios: (d) => ({
        traspasos: [...d.traspasos, {
          id: `t-${Date.now().toString(36)}`, folio, origen_id: origen, destino_id: destino, estado: 'enviado',
          items, fecha_envio: new Date().toISOString(), fecha_recepcion: null, usuario: usuario.nombre,
        }],
      }),
    })
    if (!r.ok) return setError(r.error)
    const nombre = (id) => datos.sucursales.find((s) => s.id === id)?.nombre
    avisar(`${folio} enviado de ${nombre(origen)} a ${nombre(destino)}. Queda en tránsito hasta que lo reciban.`)
    navigate('/admin/traspasos')
  }

  return (
    <>
      <Link to="/admin/traspasos" className="mb-3 inline-block text-sm font-semibold text-hielo-texto hover:underline">← Traspasos</Link>
      <Encabezado titulo="Nuevo traspaso" descripcion="Elige de dónde sale la mercancía, a dónde va y qué productos." />

      <form onSubmit={enviar} noValidate className="max-w-3xl space-y-5">
        <section className="grid gap-4 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:grid-cols-2">
          <div>
            <label htmlFor="tr-origen" className="mb-1 block text-sm font-semibold text-titanio">Sale de</label>
            {esAdmin ? (
              <select id="tr-origen" value={origen} onChange={(e) => { setOrigen(e.target.value); setRenglones([renglonVacio()]) }} className={campo}>
                <option value="">Elige el origen</option>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            ) : (
              <p className="flex h-12 items-center rounded-lg bg-fondo px-3 font-semibold">{sucursales.find((s) => s.id === origen)?.nombre}</p>
            )}
          </div>
          <div>
            <label htmlFor="tr-destino" className="mb-1 block text-sm font-semibold text-titanio">Va a</label>
            <select id="tr-destino" value={destino} onChange={(e) => setDestino(e.target.value)} className={campo}>
              <option value="">Elige el destino</option>
              {sucursales.filter((s) => s.id !== origen).map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        </section>

        <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
          <h2 className="mb-3 text-xl uppercase text-titanio">Productos</h2>
          {!origen && <p className="text-sm text-gris">Primero elige la sucursal de origen para ver qué hay disponible.</p>}
          {origen && (
            <ul className="space-y-3">
              {renglones.map((r, i) => (
                <li key={r.clave} className="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[1fr_7rem_auto]">
                  <div className="col-span-2 sm:col-span-1">
                    <label htmlFor={`tr-prod-${r.clave}`} className="mb-1 block text-xs font-semibold text-gris">Producto {i + 1}</label>
                    <SelectorProducto id={`tr-prod-${r.clave}`} valor={r.producto_id} onCambiar={(v) => cambiarRenglon(r.clave, { producto_id: v })} filtro={conExistencia} vacio="Elige un producto con existencia" />
                  </div>
                  <div>
                    <label htmlFor={`tr-cant-${r.clave}`} className="mb-1 block text-xs font-semibold text-gris">
                      Cantidad{r.producto_id && ` (hay ${disponible(r.producto_id)})`}
                    </label>
                    <input id={`tr-cant-${r.clave}`} type="number" min="1" max={disponible(r.producto_id) || undefined} inputMode="numeric" value={r.cantidad}
                      onChange={(e) => cambiarRenglon(r.clave, { cantidad: e.target.value })} className={campo} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setRenglones((rs) => (rs.length > 1 ? rs.filter((x) => x.clave !== r.clave) : [renglonVacio()]))}
                    className="flex h-12 w-12 items-center justify-center rounded-lg text-gris hover:bg-fondo hover:text-agotado"
                    aria-label={`Quitar producto ${i + 1}`}
                  >
                    <XIcon />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {origen && (
            <button type="button" onClick={() => setRenglones((rs) => [...rs, renglonVacio()])} className="mt-3 flex items-center gap-1 text-sm font-bold text-hielo-texto hover:underline">
              <PlusIcon width={18} height={18} /> Agregar otro producto
            </button>
          )}
        </section>

        {error && <p role="alert" className="rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{error}</p>}
        <button type="submit" className="btn-primary h-12 w-full text-lg sm:w-auto">Enviar traspaso</button>
        <p className="text-xs text-gris">Al enviar se descuenta del origen y queda "En tránsito" a nombre de {usuario.nombre}.</p>
      </form>
    </>
  )
}
