import { asset } from '../lib/asset'

/**
 * "Desarrollado por RMKT" con enlace a ramosmkt.lat. Va sobre fondos oscuros (titanio):
 * la "R" del logo es blanca. En gris y discreto; recupera sus colores al pasar el cursor o enfocarlo.
 * Lo usan el footer de la tienda y el panel administrativo.
 */
export default function CreditoRMKT({ className = '' }) {
  return (
    <p className={`flex items-center gap-2 text-xs text-blanco/70 ${className}`}>
      Desarrollado por
      <a
        href="https://ramosmkt.lat/"
        target="_blank"
        rel="noopener"
        className="group rounded"
        aria-label="RMKT · Ramos Digital (abre en otra pestaña)"
      >
        <img
          src={asset('img/rmkt-logo.webp')}
          alt=""
          width={50}
          height={28}
          loading="lazy"
          decoding="async"
          className="h-7 w-auto opacity-70 grayscale transition duration-200 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
        />
      </a>
    </p>
  )
}
