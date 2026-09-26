import { Link } from 'react-router-dom'
import { getBrands, getCategories } from '../services/catalog'
import { buildGeneralUrl } from '../services/whatsapp'
import { useAsync } from '../hooks/useAsync'
import { usePageMeta } from '../hooks/usePageMeta'
import WhatsAppLink from '../components/WhatsAppLink'
import { CategoryIcon, PinIcon, ShieldIcon, StoreIcon, WhatsAppIcon } from '../components/icons'

// Textos sin datos históricos inventados: año de fundación, historia y fotos reales se agregan cuando el cliente los comparta.
const pillars = [
  { Icon: PinIcon, title: '5 sucursales en el noreste', text: 'Tamaulipas, Coahuila y Nuevo León. Siempre hay una cerca de tu obra.' },
  { Icon: WhatsAppIcon, title: 'Asesoría de verdad', text: 'Te decimos qué equipo te conviene según el trabajo, no el más caro.' },
  { Icon: ShieldIcon, title: 'Marcas que aguantan', text: 'Equipo de trabajo pesado de marcas reconocidas, con atención en tienda.' },
  { Icon: StoreIcon, title: 'Recoge o te lo llevamos', text: 'Compra en línea y pasa por él, o pide envío a domicilio.' },
]

export default function About() {
  usePageMeta('Nosotros', 'Herramientas Gutiérrez: herramienta y equipo de trabajo pesado con 5 sucursales en el noreste de México.')
  const { data: categories } = useAsync(getCategories, [])
  const { data: brands } = useAsync(getBrands, [])

  return (
    <>
      <section className="bg-titanio text-blanco">
        <div className="container-page py-10 md:py-16">
          <nav aria-label="Ruta" className="mb-3 text-sm text-blanco/70">
            <Link to="/" className="hover:underline">Inicio</Link> <span aria-hidden="true">/</span> Nosotros
          </nav>
          <h1 className="max-w-3xl text-5xl uppercase leading-[0.95] md:text-6xl">Herramienta para los que trabajan duro</h1>
          <p className="mt-4 max-w-2xl text-lg text-blanco/85">
            En Herramientas Gutiérrez surtimos a contratistas, talleres, jardineros y a quien necesita resolver en casa.
            Generadores, hidrolavadoras, compresores y más, con atención directa en cada una de nuestras 5 sucursales.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ Icon, title, text }) => (
            <li key={title} className="rounded-xl bg-blanco p-5 shadow-sm ring-1 ring-titanio/5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-fondo text-hielo-texto">
                <Icon width={22} height={22} />
              </span>
              <h2 className="mt-3 text-xl uppercase text-titanio">{title}</h2>
              <p className="mt-1 text-sm text-gris">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page pb-4">
        <h2 className="text-3xl uppercase text-titanio">Lo que encuentras con nosotros</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {categories?.map((c) => (
            <li key={c.id}>
              <Link to={`/catalogo?categoria=${c.slug}`} className="flex items-center gap-2 rounded-full bg-blanco py-2 pl-3 pr-4 font-semibold text-titanio shadow-sm ring-1 ring-titanio/5 hover:ring-hielo">
                <CategoryIcon name={c.icon} width={20} height={20} className="text-hielo-texto" /> {c.name}
              </Link>
            </li>
          ))}
        </ul>
        {brands && (
          <p className="mt-6 max-w-3xl text-gris">
            Trabajamos marcas como {brands.slice(0, -1).map((b) => b.name).join(', ')} y {brands.at(-1)?.name}.
          </p>
        )}
      </section>

      <section className="container-page pt-10">
        <div className="flex flex-col items-start gap-5 rounded-2xl bg-titanio p-6 text-blanco md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h2 className="text-3xl uppercase">¿Tienes una obra en puerta?</h2>
            <p className="mt-2 max-w-xl text-blanco/80">Cuéntanos qué vas a hacer y te armamos la lista de equipo con precio y existencia.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppLink buildUrl={buildGeneralUrl} className="btn-whatsapp"><WhatsAppIcon /> Escríbenos</WhatsAppLink>
            <Link to="/sucursales" className="btn border border-blanco/30 text-blanco hover:bg-blanco/10">Ver sucursales</Link>
          </div>
        </div>
      </section>
    </>
  )
}
