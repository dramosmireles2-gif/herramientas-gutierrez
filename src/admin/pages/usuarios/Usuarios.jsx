import { useState } from 'react'
import { useAdmin } from '../../store/AdminStore'
import { useAvisos } from '../../components/Avisos'
import Confirmar from '../../components/Confirmar'
import Encabezado from '../../components/Encabezado'
import Insignia from '../../components/Insignia'
import Modal from '../../components/Modal'
import SoloAdmin from '../../components/SoloAdmin'
import { PlusIcon } from '../../../components/icons'

const campo = 'h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3'
const ROLES = {
  admin: { etiqueta: 'Administrador', descripcion: 'Todo: todas las sucursales, productos, precios, usuarios, Excel y configuración.' },
  encargado: { etiqueta: 'Encargado de sucursal', descripcion: 'Inventario y pedidos de su sucursal: entradas, ajustes y traspasos. No cambia precios ni usuarios.' },
}

function Formulario({ usuario, onCerrar }) {
  const { datos, guardarUsuario } = useAdmin()
  const avisar = useAvisos()
  const nuevo = !usuario.id
  const [f, setF] = useState(usuario)
  const [error, setError] = useState('')
  const sucursales = datos.sucursales.filter((s) => s.tipo === 'sucursal' && s.activa)
  const cambiar = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }))

  const guardar = (e) => {
    e.preventDefault()
    const r = guardarUsuario(f)
    if (!r.ok) return setError(r.error)
    avisar(nuevo ? `Usuario creado: ${r.usuario.nombre}. En la versión final recibe una invitación por correo.` : 'Usuario actualizado.')
    onCerrar()
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={nuevo ? 'Nuevo usuario' : 'Editar usuario'}
      pie={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCerrar} className="btn border border-titanio/20 text-titanio hover:bg-fondo">Cancelar</button>
          <button type="submit" form="form-usuario" className="btn-primary">{nuevo ? 'Crear usuario' : 'Guardar'}</button>
        </div>
      }
    >
      <form id="form-usuario" onSubmit={guardar} noValidate className="space-y-4">
        <div>
          <label htmlFor="usr-nombre" className="mb-1 block text-sm font-semibold text-titanio">Nombre</label>
          <input id="usr-nombre" value={f.nombre} onChange={cambiar('nombre')} maxLength={60} autoComplete="off" className={campo} />
        </div>
        <div>
          <label htmlFor="usr-correo" className="mb-1 block text-sm font-semibold text-titanio">Correo</label>
          <input id="usr-correo" type="email" value={f.correo} onChange={cambiar('correo')} maxLength={80} autoComplete="off" className={campo} />
        </div>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-titanio">Rol</legend>
          <div className="space-y-2">
            {Object.entries(ROLES).map(([v, r]) => (
              <label key={v} className={`flex cursor-pointer gap-3 rounded-lg p-3 ring-2 ${f.rol === v ? 'bg-hielo/10 ring-hielo' : 'bg-fondo ring-transparent'}`}>
                <input type="radio" name="rol" value={v} checked={f.rol === v} onChange={cambiar('rol')} className="mt-1 accent-hielo-texto" />
                <span>
                  <span className="block text-sm font-bold">{r.etiqueta}</span>
                  <span className="block text-xs text-gris">{r.descripcion}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {f.rol === 'encargado' && (
          <div>
            <label htmlFor="usr-sucursal" className="mb-1 block text-sm font-semibold text-titanio">Sucursal</label>
            <select id="usr-sucursal" value={f.sucursal_id ?? ''} onChange={cambiar('sucursal_id')} className={campo}>
              <option value="">Elige la sucursal</option>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>
        )}
        {nuevo && <p className="text-xs text-gris">En el demo no se envía la invitación por correo; en la versión final el usuario crea su contraseña desde ese correo.</p>}
        {error && <p role="alert" className="rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{error}</p>}
      </form>
    </Modal>
  )
}

export default function Usuarios() {
  const { datos, usuario: yo, eliminarUsuario } = useAdmin()
  const avisar = useAvisos()
  const [editando, setEditando] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const sucursal = (id) => datos.sucursales.find((s) => s.id === id)?.nombre
  const lista = [...datos.usuarios].sort((a, b) => (a.rol === b.rol ? a.nombre.localeCompare(b.nombre, 'es') : a.rol === 'admin' ? -1 : 1))

  return (
    <SoloAdmin titulo="Usuarios">
      <Encabezado
        titulo="Usuarios"
        descripcion="Quién entra al panel y qué puede hacer."
        acciones={
          <button type="button" onClick={() => setEditando({ nombre: '', correo: '', rol: 'encargado', sucursal_id: '' })} className="btn-primary">
            <PlusIcon width={20} height={20} /> Nuevo usuario
          </button>
        }
      />
      <ul className="divide-y divide-fondo rounded-xl bg-blanco shadow-sm ring-1 ring-titanio/5">
        {lista.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-titanio font-bold text-blanco" aria-hidden="true">
              {u.nombre.replace('Sr. ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{u.nombre}{u.id === yo.id && <span className="ml-2 text-xs font-normal text-gris">(tú)</span>}</p>
              <p className="truncate text-sm text-gris">{u.correo}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Insignia tono={u.rol === 'admin' ? 'oscuro' : 'info'}>{u.rol === 'admin' ? 'Administrador' : `Encargado · ${sucursal(u.sucursal_id)}`}</Insignia>
              <button type="button" onClick={() => setEditando(u)} className="h-10 rounded-lg px-3 text-sm font-bold text-hielo-texto ring-1 ring-titanio/15 hover:bg-fondo">Editar</button>
              {u.id !== yo.id && (
                <button type="button" onClick={() => setEliminando(u)} className="h-10 rounded-lg px-3 text-sm font-bold text-agotado ring-1 ring-agotado/30 hover:bg-agotado/10">Eliminar</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editando && <Formulario key={editando.id ?? 'nuevo'} usuario={editando} onCerrar={() => setEditando(null)} />}
      <Confirmar
        abierto={Boolean(eliminando)}
        titulo={`¿Eliminar a ${eliminando?.nombre ?? ''}?`}
        mensaje="Ya no podrá entrar al panel. Sus movimientos siguen en el historial con su nombre."
        textoConfirmar="Sí, eliminar"
        peligro
        onConfirmar={() => {
          const r = eliminarUsuario(eliminando.id)
          r.ok ? avisar(`${eliminando.nombre} eliminado.`) : avisar(r.error, 'error')
          setEliminando(null)
        }}
        onCancelar={() => setEliminando(null)}
      />
    </SoloAdmin>
  )
}
