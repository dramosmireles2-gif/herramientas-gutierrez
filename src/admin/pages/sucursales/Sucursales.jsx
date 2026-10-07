import { useState } from 'react'
import { useAdmin } from '../../store/AdminStore'
import { POR_ATENDER } from '../../store/pedidos'
import { useAvisos } from '../../components/Avisos'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import Modal from '../../components/Modal'
import { IconoSucursales } from '../../components/iconos'
import { formatoNumero } from '../../utils/formato'

const campo = 'h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3'

function Dato({ etiqueta, valor }) {
  const pendiente = /por confirmar/i.test(valor ?? '')
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-gris">{etiqueta}</dt>
      <dd className={pendiente ? 'italic text-gris' : ''}>{valor || '—'}</dd>
    </div>
  )
}

function Formulario({ sucursal, onCerrar }) {
  const { datos, guardarSucursal } = useAdmin()
  const avisar = useAvisos()
  const [f, setF] = useState(sucursal)
  const [error, setError] = useState('')

  const esProveedor = sucursal.tipo === 'proveedor'
  const cambiar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const existencias = datos.inventario.filter((x) => x.sucursal_id === sucursal.id).reduce((n, x) => n + x.cantidad, 0)
  const pedidos = datos.pedidos.filter((p) => p.sucursal_id === sucursal.id && POR_ATENDER.includes(p.estado)).length
  const encargados = datos.usuarios.filter((u) => u.sucursal_id === sucursal.id).length

  const guardar = (e) => {
    e.preventDefault()
    const r = guardarSucursal(f)
    if (!r.ok) return setError(r.error)
    avisar(`${r.sucursal.nombre} actualizada.`)
    onCerrar()
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Editar ${esProveedor ? 'proveedor' : 'sucursal'}`}
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCerrar} className="btn border border-titanio/20 text-titanio hover:bg-fondo">Cancelar</button>
          <button type="submit" form="form-sucursal" className="btn-primary">Guardar</button>
        </div>
      }
    >
      <form id="form-sucursal" onSubmit={guardar} noValidate className="space-y-4">
        {[['nombre', 'Nombre', 60], ['direccion', 'Dirección', 160], ['telefono', 'Teléfono', 40], ['horario', 'Horario', 80]].map(([k, t, max]) => (
          <div key={k}>
            <label htmlFor={`suc-${k}`} className="mb-1 block text-sm font-semibold text-titanio">{t}</label>
            <input id={`suc-${k}`} value={f[k] ?? ''} onChange={cambiar(k)} maxLength={max} className={campo} />
          </div>
        ))}
        {esProveedor ? (
          <div>
            <label htmlFor="suc-dias" className="mb-1 block text-sm font-semibold text-titanio">Días de entrega</label>
            <input id="suc-dias" type="number" min="1" max="60" inputMode="numeric" value={f.dias_entrega ?? ''} onChange={cambiar('dias_entrega')} className={`${campo} sm:w-32`} />
            <p className="mt-1 text-xs text-gris">Se muestra en los productos sobre pedido: "Entrega en X días".</p>
          </div>
        ) : (
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input type="checkbox" checked={Boolean(f.permite_recoger)} onChange={cambiar('permite_recoger')} className="h-5 w-5 accent-hielo-texto" />
            Permite recoger en tienda
          </label>
        )}
        <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={Boolean(f.activa)} onChange={cambiar('activa')} className="h-5 w-5 accent-hielo-texto" />
          Activa
        </label>
        {sucursal.activa && !f.activa && (
          <p className="rounded-lg bg-agotado/10 p-3 text-sm text-agotado">
            Al desactivarla deja de aparecer en el inventario y en los selectores.
            {existencias > 0 && ` Tiene ${formatoNumero(existencias)} piezas en existencia.`}
            {pedidos > 0 && ` Tiene ${pedidos} ${pedidos === 1 ? 'pedido' : 'pedidos'} por atender.`}
            {encargados > 0 && ` Tiene ${encargados} ${encargados === 1 ? 'encargado asignado' : 'encargados asignados'}.`}
          </p>
        )}
        {error && <p role="alert" className="rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{error}</p>}
      </form>
    </Modal>
  )
}

export default function Sucursales() {
  const { datos, esAdmin, usuario } = useAdmin()
  const [editando, setEditando] = useState(null)

  const resumen = (s) => ({
    existencias: datos.inventario.filter((x) => x.sucursal_id === s.id).reduce((n, x) => n + x.cantidad, 0),
    pedidos: datos.pedidos.filter((p) => p.sucursal_id === s.id && POR_ATENDER.includes(p.estado)).length,
    encargado: datos.usuarios.find((u) => u.sucursal_id === s.id)?.nombre,
  })
  // Sucursales primero, proveedor al final.
  const lista = [...datos.sucursales].sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'sucursal' ? -1 : 1))

  return (
    <>
      <Encabezado
        titulo="Sucursales"
        descripcion={esAdmin ? 'Las 5 sucursales y el proveedor de Monterrey. Los datos marcados "por confirmar" se llenan con la información real.' : 'Datos de contacto de las sucursales y el proveedor.'}
      />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((s) => {
          const r = resumen(s)
          const propia = !esAdmin && s.id === usuario.sucursal_id
          return (
            <li key={s.id}>
              <article className={`flex h-full flex-col rounded-xl bg-blanco p-5 shadow-sm ring-2 ${propia ? 'ring-hielo' : 'ring-titanio/5'} ${s.activa ? '' : 'opacity-70'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fondo text-hielo-texto"><IconoSucursales width={20} height={20} /></span>
                    <div>
                      <h2 className="text-xl uppercase leading-tight text-titanio">{s.nombre}</h2>
                      <p className="text-xs text-gris">{s.estado}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {s.tipo === 'proveedor' ? <Insignia tono="info">Proveedor</Insignia> : s.permite_recoger && <Insignia tono="neutro">Recoger en tienda</Insignia>}
                    {!s.activa && <Insignia tono="oscuro">Inactiva</Insignia>}
                    {propia && <Insignia tono="info">Tu sucursal</Insignia>}
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <Dato etiqueta="Dirección" valor={s.direccion} />
                  <Dato etiqueta="Teléfono" valor={s.telefono} />
                  <Dato etiqueta="Horario" valor={s.horario} />
                  {s.tipo === 'proveedor' && <Dato etiqueta="Entrega" valor={`Sobre pedido · ${s.dias_entrega} días`} />}
                </dl>
                <p className="mt-4 border-t border-fondo pt-3 text-xs text-gris">
                  {formatoNumero(r.existencias)} piezas
                  {s.tipo === 'sucursal' && ` · ${r.pedidos} ${r.pedidos === 1 ? 'pedido' : 'pedidos'} por atender`}
                  {r.encargado && ` · Encargado: ${r.encargado}`}
                </p>
                {esAdmin && (
                  <button type="button" onClick={() => setEditando(s)} className="btn mt-3 h-10 self-start px-3 text-sm text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">
                    Editar
                  </button>
                )}
              </article>
            </li>
          )
        })}
      </ul>
      {editando && <Formulario key={editando.id} sucursal={editando} onCerrar={() => setEditando(null)} />}
    </>
  )
}
