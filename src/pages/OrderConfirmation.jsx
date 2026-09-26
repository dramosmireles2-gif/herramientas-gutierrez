import { Link, useParams } from 'react-router-dom'
import { getOrder } from '../services/orders'
import { getBranch } from '../services/branches'
import { buildOrderMessage } from '../services/whatsapp'
import { useAsync } from '../hooks/useAsync'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPrice } from '../lib/format'
import { CheckIcon, PinIcon, WhatsAppIcon } from '../components/icons'

const STATUS = {
  pagado: { label: 'Pago aprobado', tone: 'bg-ok text-blanco' },
  pendiente: { label: 'Pendiente de pago', tone: 'bg-fondo text-titanio' },
  pendiente_whatsapp: { label: 'Enviado por WhatsApp', tone: 'bg-whatsapp text-cta-ink' },
  cancelado: { label: 'Cancelado', tone: 'bg-agotado text-blanco' },
}

function nextSteps(order, branch) {
  const city = branch?.city ?? 'tu sucursal'
  if (order.channel === 'whatsapp') {
    return [
      'Abrimos WhatsApp con tu pedido ya escrito. Si no se abrió, usa el botón de abajo y toca "Enviar".',
      `La sucursal ${city} te confirma existencia, total y forma de pago por el mismo chat.`,
      order.delivery === 'envio' ? 'Acuerdan juntos el día de entrega.' : 'Recoges en tienda mencionando tu folio.',
    ]
  }
  return order.delivery === 'envio'
    ? ['Te escribimos por WhatsApp para confirmar la dirección y el día de entrega.', 'Recibe tu pedido y revisa que venga completo.']
    : [`Te avisamos por WhatsApp cuando tu pedido esté listo en ${city}.`, 'Pasa a recogerlo con tu folio y una identificación.']
}

export default function OrderConfirmation() {
  const { folio } = useParams()
  const { data, loading } = useAsync(async () => {
    const order = await getOrder(folio)
    return { order, branch: order ? await getBranch(order.branch_id) : null }
  }, [folio])
  usePageMeta(`Pedido ${folio}`)

  if (loading) return <div className="container-page py-20" aria-busy="true" />

  const { order, branch } = data
  if (!order) {
    return (
      <section className="container-page py-20 text-center">
        <h1 className="text-4xl uppercase text-titanio">No encontramos el pedido {folio}</h1>
        <p className="mx-auto mt-2 max-w-md text-gris">
          En el demo, los pedidos se guardan solo en el navegador donde se hicieron. Si lo hiciste en otro dispositivo, revísalo ahí.
        </p>
        <Link to="/catalogo" className="btn-primary mt-6">Ver catálogo</Link>
      </section>
    )
  }

  const status = STATUS[order.status] ?? STATUS.pendiente
  const waUrl = buildOrderMessage(order, branch)

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok text-blanco">
          <CheckIcon width={34} height={34} strokeWidth={3} />
        </span>
        <h1 className="mt-4 text-4xl uppercase text-titanio md:text-5xl">
          {order.channel === 'whatsapp' ? '¡Pedido listo para enviar!' : '¡Gracias por tu compra!'}
        </h1>
        <p className="mt-2 text-gris">{order.customer.name}, guarda tu folio para cualquier aclaración.</p>
        <p className="price mt-4 text-4xl tracking-wide text-titanio">{order.folio}</p>
        <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${status.tone}`}>{status.label}</span>
      </div>

      {order.channel === 'whatsapp' && waUrl && (
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6 h-14 w-full text-lg">
          <WhatsAppIcon /> Abrir WhatsApp con mi pedido
        </a>
      )}

      <section className="mt-8 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6">
        <h2 className="text-2xl uppercase text-titanio">Qué sigue</h2>
        <ol className="mt-3 space-y-3">
          {nextSteps(order, branch).map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fondo text-sm font-bold text-titanio">{i + 1}</span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-5 rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5 sm:p-6">
        <h2 className="text-2xl uppercase text-titanio">Resumen</h2>
        <ul className="mt-3 divide-y divide-fondo">
          {order.items.map((i) => (
            <li key={i.product_id} className="flex justify-between gap-3 py-2 text-sm">
              <span><strong>{i.qty} ×</strong> {i.name} <span className="text-gris">· SKU {i.sku}</span></span>
              <span className="price text-base">{formatPrice(i.unit_price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1 border-t border-fondo pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="price text-base">{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío</dt><dd className="price text-base">{order.shipping ? formatPrice(order.shipping) : 'Gratis'}</dd></div>
          <div className="flex items-baseline justify-between pt-1"><dt className="font-bold">Total</dt><dd className="price text-2xl text-titanio">{formatPrice(order.total)}</dd></div>
        </dl>

        <div className="mt-4 flex items-start gap-3 rounded-lg bg-fondo p-4 text-sm">
          <PinIcon width={20} height={20} className="mt-0.5 shrink-0 text-hielo-texto" />
          <div>
            <p className="font-bold text-titanio">
              {order.delivery === 'envio' ? 'Envío a domicilio' : 'Recoger en tienda'} · Sucursal {branch?.city}
            </p>
            {order.delivery === 'envio' && order.address ? (
              <p className="text-gris">{[order.address.calle, order.address.colonia, order.address.ciudad, `CP ${order.address.cp}`].join(', ')}</p>
            ) : (
              <p className="text-gris">{branch?.address} · {branch?.hours}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link to="/catalogo" className="btn border border-titanio/20 text-titanio hover:bg-blanco">Seguir comprando</Link>
      </div>
    </div>
  )
}
