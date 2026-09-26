import { Link } from 'react-router-dom'
import { useBranch } from '../context/BranchContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { waUrl } from '../services/whatsapp'
import { CheckIcon, PinIcon, StoreIcon, WhatsAppIcon } from '../components/icons'

function InfoRow({ label, value }) {
  const pending = /por confirmar/i.test(value)
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-gris">{label}</dt>
      <dd className={pending ? 'italic text-gris' : ''}>{value}</dd>
    </div>
  )
}

export default function Branches() {
  usePageMeta(
    'Sucursales',
    'Cd. Victoria, Reynosa, Tampico, Saltillo y San Nicolás de los Garza. Recoge tu pedido en la sucursal más cercana o escríbele por WhatsApp.',
  )
  const { branches, branch: selected, selectBranch } = useBranch()

  return (
    <>
      <section className="bg-titanio text-blanco">
        <div className="container-page py-10 md:py-14">
          <nav aria-label="Ruta" className="mb-3 text-sm text-blanco/70">
            <Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span> Sucursales
          </nav>
          <h1 className="text-5xl uppercase leading-[0.95] md:text-6xl">5 sucursales en el noreste</h1>
          <p className="mt-3 max-w-2xl text-lg text-blanco/85">
            Compra en línea y recoge en la que te quede más cerca, o escríbele directo por WhatsApp para cotizar y apartar.
          </p>
        </div>
      </section>

      <div className="container-page py-8 md:py-12">
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Reserva el espacio mientras llegan las sucursales para que la página no salte. */}
          {branches.length === 0 && Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="h-96 animate-pulse rounded-2xl bg-blanco" aria-hidden="true" />
          ))}
          {branches.map((b) => {
            const isSelected = selected?.id === b.id
            return (
              <li key={b.id}>
                <article className={`flex h-full flex-col rounded-2xl bg-blanco p-5 shadow-sm ring-2 sm:p-6 ${isSelected ? 'ring-hielo' : 'ring-titanio/5'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fondo text-hielo-texto">
                        <StoreIcon width={22} height={22} />
                      </span>
                      <div>
                        <h2 className="text-2xl uppercase leading-none text-titanio">{b.city}</h2>
                        <p className="text-sm text-gris">{b.state}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-hielo/15 px-2.5 py-1 text-xs font-bold text-hielo-texto">
                        <CheckIcon width={14} height={14} strokeWidth={3} /> Tu sucursal
                      </span>
                    )}
                  </div>

                  <dl className="mt-5 space-y-3 text-sm">
                    <InfoRow label="Dirección" value={b.address} />
                    <InfoRow label="Horario" value={b.hours} />
                    <InfoRow label="Teléfono" value={b.phone} />
                  </dl>

                  <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
                    <a
                      href={waUrl(b.whatsapp, `Hola, les escribo desde la tienda en línea (sucursal ${b.city}).`)}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-whatsapp"
                    >
                      <WhatsAppIcon width={20} height={20} /> WhatsApp
                    </a>
                    <a href={b.maps_url} target="_blank" rel="noopener noreferrer" className="btn border border-titanio/20 text-titanio hover:bg-fondo">
                      <PinIcon width={20} height={20} /> Cómo llegar
                    </a>
                    {!isSelected && (
                      <button type="button" onClick={() => selectBranch(b.id)} className="btn text-hielo-texto hover:bg-fondo sm:col-span-2">
                        Elegir como mi sucursal
                      </button>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
