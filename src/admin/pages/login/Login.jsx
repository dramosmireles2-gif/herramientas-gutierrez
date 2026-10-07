import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../store/AdminStore'
import { usePageMeta } from '../../../hooks/usePageMeta'
import Logo from '../../../components/Logo'

// Login simulado (sección 4.1): datos precargados, cualquier valor entra; se elige el rol para la demo.
export default function Login() {
  usePageMeta('Entrar · Panel')
  const { datos, cambiarUsuario } = useAdmin()
  const navigate = useNavigate()
  const [usuarioId, setUsuarioId] = useState('u-admin')

  const entrar = (e) => {
    e.preventDefault()
    cambiarUsuario(usuarioId)
    navigate('/admin', { replace: true })
  }

  const encargados = datos.usuarios.filter((u) => u.rol === 'encargado')
  const sucursal = (id) => datos.sucursales.find((s) => s.id === id)?.nombre

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-titanio px-4 py-10">
      <Logo />
      <form onSubmit={entrar} className="mt-8 w-full max-w-sm rounded-2xl bg-blanco p-6 shadow-xl">
        <h1 className="text-3xl uppercase text-titanio">Panel administrativo</h1>
        <p className="mt-1 text-sm text-gris">Versión demo: cualquier dato entra.</p>

        <label htmlFor="login-correo" className="mb-1 mt-5 block text-sm font-semibold text-titanio">Correo</label>
        <input id="login-correo" type="email" defaultValue="admin@example.com" autoComplete="off" className="h-12 w-full rounded-lg border border-gris/40 px-3" />

        <label htmlFor="login-clave" className="mb-1 mt-4 block text-sm font-semibold text-titanio">Contraseña</label>
        <input id="login-clave" type="password" defaultValue="demo1234" autoComplete="off" className="h-12 w-full rounded-lg border border-gris/40 px-3" />

        <label htmlFor="login-rol" className="mb-1 mt-4 block text-sm font-semibold text-titanio">Entrar como</label>
        <select id="login-rol" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3">
          <option value="u-admin">Administrador</option>
          {encargados.map((u) => <option key={u.id} value={u.id}>Encargado — {sucursal(u.sucursal_id)}</option>)}
        </select>

        <button type="submit" className="btn-primary mt-6 h-12 w-full text-lg">Entrar</button>
      </form>
    </div>
  )
}
