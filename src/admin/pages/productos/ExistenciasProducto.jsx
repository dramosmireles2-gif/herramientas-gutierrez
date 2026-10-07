import { useState } from 'react'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import FormularioMovimiento from '../../components/FormularioMovimiento'
import { InsigniaExistencia } from '../../components/Insignia'
import { estadoExistencia } from '../../utils/existencias'

/** Existencia y mínimo por sucursal, con "Ajustar" y "Entrada" en cada fila. */
export default function ExistenciasProducto({ producto }) {
  const { datos, esAdmin, usuario, actualizarMinimo } = useAdmin()
  const avisar = useAvisos()
  const [accion, setAccion] = useState(null) // { modo, sucursalId }

  const filas = datos.sucursales
    .filter((s) => (producto.tipo === 'sobre_pedido' ? s.tipo === 'proveedor' : s.tipo === 'sucursal'))
    .filter((s) => esAdmin || s.id === usuario.sucursal_id)
    .map((s) => ({ s, f: datos.inventario.find((x) => x.producto_id === producto.id && x.sucursal_id === s.id) ?? { cantidad: 0, minimo: 0 } }))
  const total = filas.reduce((n, { f }) => n + f.cantidad, 0)

  // Enter guarda igual que salir del campo.
  const enterGuarda = (e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())

  const guardarMinimo = (sucursal, valor, anterior) => {
    if (String(valor) === String(anterior)) return
    const r = actualizarMinimo(producto.id, sucursal.id, valor)
    r.ok ? avisar(`Mínimo de ${sucursal.nombre}: ${Math.max(0, Math.floor(Number(valor) || 0))}.`) : avisar(r.error, 'error')
  }

  return (
    <section>
      {producto.tipo === 'sobre_pedido' && (
        <p className="mb-4 rounded-lg bg-hielo/15 p-3 text-sm text-titanio">
          Producto <strong>sobre pedido</strong>: se surte del proveedor y solo se envía. Entrega estimada en {filas[0]?.s.dias_entrega ?? '—'} días.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-fondo text-xs uppercase tracking-wide text-gris">
            <tr>
              <th scope="col" className="px-4 py-3 font-bold">Sucursal</th>
              <th scope="col" className="px-4 py-3 font-bold">Existencia</th>
              <th scope="col" className="hidden px-4 py-3 font-bold sm:table-cell">Mínimo</th>
              <th scope="col" className="px-4 py-3 text-right font-bold"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fondo">
            {filas.map(({ s, f }) => (
              <tr key={s.id}>
                <td className="px-3 py-3 font-semibold sm:px-4">
                  {s.nombre}
                  {/* En móvil el mínimo va debajo del nombre */}
                  <label className="mt-1 flex items-center gap-2 text-xs font-normal text-gris sm:hidden">
                    Mínimo
                    <input
                      key={`m-${f.minimo}`} // se re-sincroniza si el mínimo cambia (p. ej. al reiniciar el demo)
                      type="number" min="0" inputMode="numeric" defaultValue={f.minimo}
                      onBlur={(e) => guardarMinimo(s, e.target.value, f.minimo)}
                      onKeyDown={enterGuarda}
                      enterKeyHint="done"
                      className="h-9 w-16 rounded-md border border-gris/40 px-2 text-sm text-texto"
                    />
                  </label>
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="price text-2xl text-titanio">{f.cantidad}</span>
                    {producto.tipo === 'inventariado' && <InsigniaExistencia estado={estadoExistencia(f)} />}
                  </span>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <label className="sr-only" htmlFor={`min-${s.id}`}>Mínimo en {s.nombre}</label>
                  <input
                    key={`d-${f.minimo}`}
                    id={`min-${s.id}`} type="number" min="0" inputMode="numeric" defaultValue={f.minimo}
                    onBlur={(e) => guardarMinimo(s, e.target.value, f.minimo)}
                    onKeyDown={enterGuarda}
                    enterKeyHint="done"
                    className="h-10 w-20 rounded-md border border-gris/40 px-2"
                  />
                </td>
                <td className="py-3 pl-1 pr-3 sm:px-4">
                  <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:justify-end">
                    <button type="button" onClick={() => setAccion({ modo: 'ajuste', sucursalId: s.id })} className="h-10 rounded-lg px-3 text-sm font-bold text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">Ajustar</button>
                    <button type="button" onClick={() => setAccion({ modo: 'entrada', sucursalId: s.id })} className="h-10 rounded-lg px-3 text-sm font-bold text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">Entrada</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          {filas.length > 1 && (
            <tfoot className="border-t-2 border-fondo">
              <tr>
                <th scope="row" className="px-4 py-3 text-left">Total</th>
                <td className="price px-4 py-3 text-2xl text-titanio" colSpan={3}>{total}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <p className="mt-2 text-xs text-gris">El mínimo se guarda al salir del campo o con Enter. Cuando la existencia queda abajo, el producto aparece en "Existencia baja".</p>

      <FormularioMovimiento
        abierto={Boolean(accion)}
        modo={accion?.modo}
        productoId={producto.id}
        sucursalId={accion?.sucursalId}
        onCerrar={() => setAccion(null)}
      />
    </section>
  )
}
