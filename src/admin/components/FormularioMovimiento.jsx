import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAdmin } from '../store/AdminStore'
import { MOTIVOS_AJUSTE } from '../store/movimientos'
import { filaInventario } from '../utils/existencias'
import { useAvisos } from './Avisos'
import Modal from './Modal'
import SelectorProducto from './SelectorProducto'

const OTRO = 'Otro'
const campo = 'h-12 w-full rounded-lg border bg-blanco px-3'

/**
 * Registrar entrada de mercancía o ajuste de inventario.
 * Todo pasa por registrarMovimiento(): valida, actualiza existencias y deja el movimiento en el historial.
 *
 * @param {'entrada'|'ajuste'} modo
 * @param {string} [productoId] / [sucursalId]  fijos si se abre desde una ficha o una celda
 */
export default function FormularioMovimiento({ abierto, modo, productoId: productoFijo, sucursalId: sucursalFija, onCerrar }) {
  const { datos, usuario, esAdmin, sucursalFiltro, registrarMovimiento } = useAdmin()
  const avisar = useAvisos()
  const esAjuste = modo === 'ajuste'

  const sucursalesPermitidas = datos.sucursales.filter((s) => s.activa && (esAdmin || s.id === usuario.sucursal_id))
  const sucursalInicial = sucursalFija ?? (sucursalFiltro !== 'todas' ? sucursalFiltro : esAdmin ? '' : usuario.sucursal_id)

  const [productoId, setProductoId] = useState(productoFijo ?? '')
  const [sucursalId, setSucursalId] = useState(sucursalInicial)
  const [forma, setForma] = useState('nueva') // ajuste: 'nueva' cantidad o 'diferencia'
  const [valor, setValor] = useState('')
  const [motivo, setMotivo] = useState('')
  const [motivoOtro, setMotivoOtro] = useState('')
  const [referencia, setReferencia] = useState('')
  const [error, setError] = useState('')

  // Al abrir, reinicia el formulario.
  useEffect(() => {
    if (!abierto) return
    setProductoId(productoFijo ?? '')
    setSucursalId(sucursalInicial)
    setForma('nueva')
    setValor('')
    setMotivo('')
    setMotivoOtro('')
    setReferencia('')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  const sucursal = datos.sucursales.find((s) => s.id === sucursalId)
  const producto = datos.productos.find((p) => p.id === productoId)
  // Solo productos que se manejan en esa ubicación (inventariados en sucursal, sobre pedido en proveedor).
  const filtroProducto = useCallback(
    (p) => !sucursal || (sucursal.tipo === 'proveedor' ? p.tipo === 'sobre_pedido' : p.tipo === 'inventariado'),
    [sucursal],
  )
  const actual = productoId && sucursalId ? filaInventario(datos.inventario, productoId, sucursalId)?.cantidad ?? 0 : null

  const numero = valor === '' ? null : Number(valor)
  const delta = useMemo(() => {
    if (numero == null || !Number.isInteger(numero)) return null
    if (!esAjuste) return numero
    return forma === 'nueva' ? (actual == null ? null : numero - actual) : numero
  }, [numero, esAjuste, forma, actual])
  const resultado = actual != null && delta != null ? actual + delta : null

  const guardar = (e) => {
    e.preventDefault()
    setError('')
    if (!sucursalId) return setError('Elige la sucursal.')
    if (!productoId) return setError('Elige el producto.')
    if (numero == null || !Number.isInteger(numero)) return setError('Escribe una cantidad en números enteros.')
    if (!esAjuste && numero <= 0) return setError('La cantidad que entra debe ser mayor que cero.')
    if (esAjuste && forma === 'nueva' && numero < 0) return setError('La nueva cantidad no puede ser negativa.')
    if (esAjuste && delta === 0) return setError('La existencia queda igual; no hay nada que ajustar.')
    const motivoFinal = motivo === OTRO ? motivoOtro.trim() : motivo
    if (esAjuste && !motivoFinal) return setError('Elige el motivo del ajuste.')

    const r = registrarMovimiento(
      esAjuste
        ? { producto_id: productoId, sucursal_id: sucursalId, tipo: 'ajuste', cantidad: delta, motivo: motivoFinal, referencia }
        : { producto_id: productoId, sucursal_id: sucursalId, tipo: 'entrada', cantidad: numero, referencia },
    )
    if (!r.ok) return setError(r.error)
    const m = r.movimientos[0]
    avisar(`${esAjuste ? 'Ajuste registrado' : 'Entrada registrada'}: ${producto.nombre} en ${sucursal.nombre}, ${m.existencia_antes} → ${m.existencia_despues}.`)
    onCerrar()
  }

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={esAjuste ? 'Ajuste de inventario' : 'Registrar entrada'}
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCerrar} className="btn border border-titanio/20 text-titanio hover:bg-fondo">Cancelar</button>
          <button type="submit" form="form-movimiento" className="btn-primary">{esAjuste ? 'Guardar ajuste' : 'Registrar entrada'}</button>
        </div>
      }
    >
      <form id="form-movimiento" onSubmit={guardar} noValidate className="space-y-4">
        <p className="text-sm text-gris">
          {esAjuste
            ? 'Corrige la existencia cuando no cuadra con lo que hay en tienda. El motivo queda en el historial.'
            : 'Mercancía que llegó de un proveedor. Se suma a la existencia de la sucursal.'}
        </p>

        <div>
          <label htmlFor="mov-sucursal" className="mb-1 block text-sm font-semibold text-titanio">Sucursal</label>
          {sucursalFija || sucursalesPermitidas.length === 1 ? (
            <p className="flex h-12 items-center rounded-lg bg-fondo px-3 font-semibold">{(sucursal ?? sucursalesPermitidas[0])?.nombre}</p>
          ) : (
            <select id="mov-sucursal" value={sucursalId} onChange={(e) => { setSucursalId(e.target.value); setProductoId(productoFijo ?? '') }} className={`${campo} border-gris/40`}>
              <option value="">Elige la sucursal</option>
              {sucursalesPermitidas.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="mov-producto" className="mb-1 block text-sm font-semibold text-titanio">Producto</label>
          {productoFijo ? (
            <p className="flex min-h-12 items-center rounded-lg bg-fondo px-3 py-2 font-semibold">{producto?.nombre}</p>
          ) : (
            <SelectorProducto id="mov-producto" valor={productoId} onCambiar={setProductoId} filtro={filtroProducto} />
          )}
        </div>

        {esAjuste && (
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-titanio">¿Cómo quieres ajustar?</legend>
            <div className="grid grid-cols-2 gap-2">
              {[['nueva', 'Nueva cantidad'], ['diferencia', 'Diferencia (+/−)']].map(([v, t]) => (
                <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold ring-2 ${forma === v ? 'bg-hielo/10 ring-hielo' : 'bg-fondo ring-transparent'}`}>
                  <input type="radio" name="forma" value={v} checked={forma === v} onChange={() => { setForma(v); setValor('') }} className="accent-hielo-texto" />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div>
          <label htmlFor="mov-cantidad" className="mb-1 block text-sm font-semibold text-titanio">
            {!esAjuste ? 'Cantidad que entra' : forma === 'nueva' ? 'Cantidad real (lo que hay en tienda)' : 'Diferencia (ej. -2 o 3)'}
          </label>
          <input
            id="mov-cantidad"
            type="number"
            inputMode={esAjuste && forma === 'diferencia' ? 'text' : 'numeric'}
            step="1"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className={`${campo} border-gris/40`}
          />
          {actual != null && (
            <p className="mt-2 text-sm" aria-live="polite">
              Existencia actual: <strong className="price text-base">{actual}</strong>
              {resultado != null && delta !== 0 && (
                <> → queda en <strong className={`price text-base ${resultado < 0 ? 'text-agotado' : 'text-titanio'}`}>{resultado}</strong></>
              )}
            </p>
          )}
        </div>

        {esAjuste && (
          <div>
            <label htmlFor="mov-motivo" className="mb-1 block text-sm font-semibold text-titanio">Motivo <span className="font-normal text-gris">(obligatorio)</span></label>
            <select id="mov-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} className={`${campo} border-gris/40`}>
              <option value="">Elige el motivo</option>
              {MOTIVOS_AJUSTE.map((m) => <option key={m}>{m}</option>)}
              <option>{OTRO}</option>
            </select>
            {motivo === OTRO && (
              <input aria-label="Describe el motivo" value={motivoOtro} onChange={(e) => setMotivoOtro(e.target.value)} maxLength={80} placeholder="Describe el motivo" className={`${campo} mt-2 border-gris/40`} />
            )}
          </div>
        )}

        <div>
          <label htmlFor="mov-referencia" className="mb-1 block text-sm font-semibold text-titanio">
            {esAjuste ? 'Nota' : 'Referencia'} <span className="font-normal text-gris">(opcional)</span>
          </label>
          <input
            id="mov-referencia"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            maxLength={80}
            placeholder={esAjuste ? 'Ej. conteo del sábado' : 'Ej. Factura A-1234 · Distribuidora del Norte'}
            className={`${campo} border-gris/40`}
          />
        </div>

        {error && <p role="alert" className="rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{error}</p>}
        <p className="text-xs text-gris">Queda registrado a nombre de {usuario.nombre}.</p>
      </form>
    </Modal>
  )
}
