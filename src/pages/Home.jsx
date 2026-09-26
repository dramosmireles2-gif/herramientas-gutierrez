import { Link } from 'react-router-dom'

// Versión mínima del Inicio; la página completa se arma en el paso 3.
export default function Home() {
  return (
    <section className="bg-titanio text-blanco">
      <div className="container-page py-14 md:py-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-hielo">5 sucursales en el noreste</p>
        <h1 className="mt-3 max-w-2xl text-5xl uppercase leading-[0.95] md:text-7xl">
          Todo para la obra, en 5 sucursales del noreste
        </h1>
        <p className="mt-5 max-w-xl text-lg text-blanco/85">
          Generadores, hidrolavadoras, compresores y herramienta de trabajo pesado. Compra en línea o pide por WhatsApp y recoge en tu sucursal.
        </p>
        <Link to="/catalogo" className="btn-primary mt-8">Ver catálogo</Link>
      </div>
    </section>
  )
}
