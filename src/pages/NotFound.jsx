import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound({ title = 'No encontramos esta página' }) {
  usePageMeta(title)
  return (
    <section className="container-page py-20 text-center">
      <h1 className="text-4xl uppercase text-titanio">{title}</h1>
      <p className="mt-3 text-gris">Puede que el enlace haya cambiado. Revisa el catálogo o vuelve al inicio.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
        <Link to="/" className="btn border border-titanio/20 text-titanio hover:bg-blanco">Ir al inicio</Link>
      </div>
    </section>
  )
}
