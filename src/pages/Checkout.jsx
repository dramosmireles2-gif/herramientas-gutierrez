import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useBranch } from '../context/BranchContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice } from '../lib/format'
import { onlyDigits } from '../lib/sanitize'
import { SHIPPING, calcShipping, createOrder, updateOrderStatus } from '../services/orders'
import { createCheckout } from '../services/payments'
import { buildOrderMessage } from '../services/whatsapp'
import FormField from '../components/FormField'
import ProcessingOverlay from '../components/ProcessingOverlay'
import ProductImage from '../components/ProductImage'
import { CartIcon, PinIcon, ShieldIcon, StoreIcon, WhatsAppIcon } from '../components/icons'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(form, delivery) {
  const e = {}
  if (form.name.trim().length < 3) e.name = 'Escribe tu nombre completo.'
  if (onlyDigits(form.phone).length !== 10) e.phone = 'El teléfono debe tener 10 dígitos.'
  if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) e.email = 'Revisa el correo; parece incompleto.'
  if (delivery === 'envio') {
    if (form.calle.trim().length < 3) e.calle = 'Escribe calle y número.'
    if (form.colonia.trim().length < 2) e.colonia = 'Escribe la colonia.'
    if (form.ciudad.trim().length < 2) e.ciudad = 'Escribe la ciudad.'
    if (!/^\d{5}$/.test(onlyDigits(form.cp))) e.cp = 'El código postal tiene 5 dígitos.'
  }
  return e
}

function Section({ step, title, children }) {
  return (
    <section className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6">
      <h2 className="flex items-center gap-3 text-2xl uppercase text-titanio">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-titanio font-sans text-sm font-bold text-blanco [font-stretch:normal]">{step}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DeliveryOption({ value, current, onChange, Icon, title, text }) {
  const checked = current === value
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl p-4 ring-2 transition ${checked ? 'bg-hielo/10 ring-hielo' : 'bg-fondo ring-transparent hover:ring-titanio/20'}`}>
      <input type="radio" name="delivery" value={value} checked={checked} onChange={() => onChange(value)} className="mt-1 h-5 w-5 accent-hielo-texto" />
      <Icon width={22} height={22} className="mt-0.5 shrink-0 text-hielo-texto" aria-hidden="true" />
      <span>
        <span className="block font-bold text-titanio">{title}</span>
        <span className="block text-sm text-gris">{text}</span>
      </span>
    </label>
  )
}

export default function Checkout() {
  usePageMeta('Finalizar compra')
  const navigate = useNavigate()
  const { lines, count, subtotal, clear } = useCart()
  const { branch, openPicker } = useBranch()

  const [form, setForm] = useState({ name: '', phone: '', email: '', calle: '', colonia: '', ciudad: '', cp: '', referencias: '' })
  const [delivery, setDelivery] = useState('recoger')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(null) // 'web' | 'whatsapp'
  const [failure, setFailure] = useState('')

  const shipping = calcShipping(subtotal, delivery)
  const total = subtotal + shipping

  if (lines.length === 0 && !submitting) {
    return (
      <section className="container-page py-20 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blanco text-gris shadow-sm">
          <CartIcon width={36} height={36} />
        </span>
        <h1 className="mt-5 text-4xl uppercase text-titanio">No hay nada que pagar todavía</h1>
        <p className="mt-2 text-gris">Agrega productos a tu carrito para continuar.</p>
        <Link to="/catalogo" className="btn-primary mt-6">Ver catálogo</Link>
      </section>
    )
  }

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }))
  }

  const submit = async (channel) => {
    setFailure('')
    const found = validate(form, delivery)
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus()
      return
    }
    if (!branch) {
      openPicker()
      return
    }

    setSubmitting(channel)
    try {
      const order = await createOrder({
        lines,
        branch,
        delivery,
        channel,
        customer: { name: form.name, phone: form.phone, email: form.email },
        address: { calle: form.calle, colonia: form.colonia, ciudad: form.ciudad, cp: form.cp, referencias: form.referencias },
      })

      if (channel === 'whatsapp') {
        // Si el navegador bloquea la ventana, la confirmación tiene el botón para abrirla de nuevo.
        window.open(buildOrderMessage(order, branch), '_blank', 'noopener')
      } else {
        const payment = await createCheckout(order)
        if (payment.status !== 'approved') throw new Error('El pago no se aprobó.')
        await updateOrderStatus(order.folio, 'pagado') // demo: en producción lo hace el webhook
      }
      clear()
      navigate(`/pedido/${order.folio}`, { replace: true })
    } catch (err) {
      setSubmitting(null)
      setFailure(err?.message || 'No pudimos completar tu pedido. Intenta de nuevo.')
    }
  }

  const summary = (
    <aside aria-label="Resumen del pedido" className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6 lg:sticky lg:top-24">
      <h2 className="text-2xl uppercase text-titanio">Tu pedido</h2>
      <ul className="mt-4 divide-y divide-fondo">
        {lines.map(({ product, qty, total: lineTotal }) => (
          <li key={product.id} className="flex items-center gap-3 py-3">
            <div className="relative w-14 shrink-0 rounded-md ring-1 ring-titanio/10">
              <ProductImage src={product.images[0]} srcSet={product.image_srcsets?.[0]} sizes="56px" alt="" className="rounded-md" />
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-titanio px-1 text-xs font-bold text-blanco">{qty}</span>
            </div>
            <p className="line-clamp-2 flex-1 text-sm">{product.name}</p>
            <p className="price text-base text-titanio">{formatPrice(lineTotal)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-2 border-t border-fondo pt-3 text-sm">
        <div className="flex justify-between"><dt>Productos ({count})</dt><dd className="price text-base">{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>{delivery === 'envio' ? 'Envío a domicilio' : 'Recoger en tienda'}</dt>
          <dd className="price text-base">{shipping ? formatPrice(shipping) : 'Gratis'}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-baseline justify-between border-t border-fondo pt-3">
        <span className="font-bold">Total</span>
        <span className="price text-3xl text-titanio">{formatPrice(total)}</span>
      </div>

      {failure && <p role="alert" className="mt-4 rounded-lg bg-agotado/10 p-3 text-sm font-semibold text-agotado">{failure}</p>}

      <button type="button" onClick={() => submit('web')} disabled={!!submitting} className="btn-primary mt-4 h-14 w-full text-lg">
        Pagar {formatPrice(total)}
      </button>
      <button type="button" onClick={() => submit('whatsapp')} disabled={!!submitting} className="btn-whatsapp mt-3 h-12 w-full">
        <WhatsAppIcon /> Enviar pedido por WhatsApp
      </button>
      <p className="mt-3 flex items-start gap-2 text-xs text-gris">
        <ShieldIcon width={16} height={16} className="mt-0.5 shrink-0" />
        Demo: el pago es simulado y no se hace ningún cargo. Por WhatsApp, la sucursal te confirma existencia y forma de pago.
      </p>
    </aside>
  )

  return (
    <div className="container-page py-6 md:py-10">
      <nav aria-label="Ruta" className="mb-2 text-sm text-gris">
        <Link to="/carrito" className="hover:underline">Carrito</Link> <span aria-hidden="true">/</span> Finalizar compra
      </nav>
      <h1 className="text-4xl uppercase text-titanio md:text-5xl">Finalizar compra</h1>

      <form noValidate onSubmit={(e) => { e.preventDefault(); submit('web') }} className="mt-6 grid gap-5 lg:grid-cols-[1fr_24rem] lg:items-start">
        <div className="space-y-5">
          <Section step="1" title="Tus datos">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="name" label="Nombre completo" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} maxLength={80} className="sm:col-span-2" />
              <FormField
                id="phone" label="Teléfono (WhatsApp)" type="tel" inputMode="numeric" autoComplete="tel-national"
                value={form.phone} onChange={set('phone')} error={errors.phone} hint="10 dígitos, sin lada internacional" maxLength={14}
              />
              <FormField id="email" label="Correo" type="email" autoComplete="email" optional value={form.email} onChange={set('email')} error={errors.email} maxLength={120} />
            </div>
          </Section>

          <Section step="2" title="Entrega">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Forma de entrega">
              <DeliveryOption value="recoger" current={delivery} onChange={setDelivery} Icon={StoreIcon} title="Recoger en sucursal" text="Gratis. Te avisamos cuando esté listo." />
              <DeliveryOption
                value="envio" current={delivery} onChange={setDelivery} Icon={PinIcon} title="Envío a domicilio"
                text={`${formatPrice(SHIPPING.flat)} · gratis desde ${formatPrice(SHIPPING.freeFrom)}`}
              />
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-lg bg-fondo p-4 text-sm">
              <PinIcon width={20} height={20} className="mt-0.5 shrink-0 text-hielo-texto" />
              <div className="flex-1">
                {branch ? (
                  <>
                    <p className="font-bold text-titanio">Sucursal {branch.city}, {branch.state}</p>
                    <p className="text-gris">{delivery === 'recoger' ? branch.address : 'Surte y envía tu pedido.'}</p>
                  </>
                ) : (
                  <p className="font-bold text-agotado">Elige la sucursal que atiende tu pedido.</p>
                )}
              </div>
              <button type="button" onClick={openPicker} className="font-semibold text-hielo-texto hover:underline">
                {branch ? 'Cambiar' : 'Elegir'}
              </button>
            </div>

            {delivery === 'envio' && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField id="calle" label="Calle y número" autoComplete="address-line1" value={form.calle} onChange={set('calle')} error={errors.calle} maxLength={120} className="sm:col-span-2" />
                <FormField id="colonia" label="Colonia" autoComplete="address-line2" value={form.colonia} onChange={set('colonia')} error={errors.colonia} maxLength={80} />
                <FormField id="cp" label="Código postal" inputMode="numeric" autoComplete="postal-code" value={form.cp} onChange={set('cp')} error={errors.cp} maxLength={5} />
                <FormField id="ciudad" label="Ciudad" autoComplete="address-level2" value={form.ciudad} onChange={set('ciudad')} error={errors.ciudad} maxLength={80} />
                <FormField id="referencias" label="Referencias" optional value={form.referencias} onChange={set('referencias')} maxLength={160} hint="Entre calles, color de fachada…" />
              </div>
            )}
          </Section>
        </div>

        {summary}
      </form>

      {submitting === 'web' && <ProcessingOverlay total={formatPrice(total)} />}
    </div>
  )
}
