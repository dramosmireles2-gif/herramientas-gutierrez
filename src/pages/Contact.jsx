import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { sanitize } from '../lib/sanitize'
import { waUrl } from '../services/whatsapp'
import FormField from '../components/FormField'
import { PinIcon, WhatsAppIcon } from '../components/icons'

const TOPICS = ['Cotización', 'Existencia de un producto', 'Pedido que ya hice', 'Garantía o servicio', 'Otro']

export default function Contact() {
  usePageMeta('Contacto', 'Escríbenos por WhatsApp a la sucursal más cercana: cotizaciones, existencias, pedidos y garantías.')
  const { branches, branch } = useBranch()

  const [branchId, setBranchId] = useState(branch?.id ?? '')
  const [topic, setTopic] = useState(TOPICS[0])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})

  // Si el cliente elige sucursal después de abrir la página, se usa esa.
  useEffect(() => {
    if (branch && !branchId) setBranchId(branch.id)
  }, [branch, branchId])

  // El formulario no guarda nada: arma el mensaje y abre WhatsApp de la sucursal.
  const onSubmit = (e) => {
    e.preventDefault()
    const found = {}
    if (!branchId) found.branch = 'Elige una sucursal.'
    if (name.trim().length < 2) found.name = 'Escribe tu nombre.'
    if (message.trim().length < 5) found.message = 'Cuéntanos un poco más.'
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(found.branch ? 'contact-branch' : found.name ? 'contact-name' : 'contact-message')?.focus()
      return
    }
    const target = branches.find((b) => b.id === branchId)
    const text = `Hola, soy ${sanitize(name, 80)}.\nTema: ${topic}\n${sanitize(message, 600)}\n(Sucursal ${target.city}, desde la tienda en línea)`
    window.open(waUrl(target.whatsapp, text), '_blank', 'noopener')
  }

  return (
    <div className="container-page py-6 md:py-10">
      <nav aria-label="Ruta" className="mb-2 text-sm text-gris">
        <Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span> Contacto
      </nav>
      <h1 className="text-4xl uppercase text-titanio md:text-5xl">Contacto</h1>
      <p className="mt-2 max-w-2xl text-gris">
        La forma más rápida de resolver es por WhatsApp. Elige tu sucursal, cuéntanos qué necesitas y te contestamos ahí mismo.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <form noValidate onSubmit={onSubmit} className="space-y-4 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact-branch" className="mb-1 block text-sm font-semibold text-titanio">Sucursal</label>
              <select
                id="contact-branch" value={branchId} onChange={(e) => setBranchId(e.target.value)}
                aria-invalid={errors.branch ? true : undefined} aria-describedby={errors.branch ? 'contact-branch-error' : undefined}
                className={`h-12 w-full rounded-lg border bg-blanco px-3 ${errors.branch ? 'border-agotado' : 'border-gris/40'}`}
              >
                <option value="" disabled>Elige una sucursal</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.city}</option>)}
              </select>
              {errors.branch && <p id="contact-branch-error" className="mt-1 text-sm font-semibold text-agotado">{errors.branch}</p>}
            </div>
            <div>
              <label htmlFor="contact-topic" className="mb-1 block text-sm font-semibold text-titanio">Tema</label>
              <select id="contact-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="h-12 w-full rounded-lg border border-gris/40 bg-blanco px-3">
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <FormField id="contact-name" label="Tu nombre" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} maxLength={80} />
          <div>
            <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold text-titanio">Mensaje</label>
            <textarea
              id="contact-message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={600}
              aria-invalid={errors.message ? true : undefined} aria-describedby={errors.message ? 'contact-message-error' : undefined}
              placeholder="Ej. Busco un generador para una obra, que aguante una revolvedora y luces."
              className={`w-full rounded-lg border bg-blanco p-3 ${errors.message ? 'border-agotado' : 'border-gris/40'}`}
            />
            {errors.message && <p id="contact-message-error" className="mt-1 text-sm font-semibold text-agotado">{errors.message}</p>}
          </div>
          <button type="submit" className="btn-whatsapp h-12 w-full sm:w-auto">
            <WhatsAppIcon /> Enviar por WhatsApp
          </button>
        </form>

        <aside aria-label="Sucursales" className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
          <h2 className="text-2xl uppercase text-titanio">Nuestras sucursales</h2>
          <ul className="mt-3 divide-y divide-fondo">
            {branches.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <PinIcon width={18} height={18} className="shrink-0 text-hielo-texto" />
                <span className="flex-1">
                  <span className="block font-semibold">{b.city}</span>
                  <span className="block text-xs text-gris">{b.hours}</span>
                </span>
                <a
                  href={waUrl(b.whatsapp, `Hola, les escribo desde la tienda en línea (sucursal ${b.city}).`)}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-cta-ink"
                  aria-label={`WhatsApp sucursal ${b.city}`}
                >
                  <WhatsAppIcon width={20} height={20} />
                </a>
              </li>
            ))}
          </ul>
          <Link to="/sucursales" className="mt-2 block text-sm font-bold text-hielo-texto hover:underline">Ver direcciones y horarios</Link>
        </aside>
      </div>
    </div>
  )
}
