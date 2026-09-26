import { Link } from 'react-router-dom'
import Logo from './Logo'
import SearchBar from './SearchBar'
import { CartIcon, ChevronDownIcon, PinIcon } from './icons'

// branchName y cartCount se conectan a BranchContext / CartContext en el paso 4.
export default function Header({ branchName = null, cartCount = 0, onBranchClick }) {
  const cartLabel = cartCount === 1 ? '1 producto' : `${cartCount} productos`

  return (
    <header className="sticky top-0 z-40 bg-titanio text-blanco shadow-md">
      <div className="container-page flex h-16 items-center gap-3 md:h-20 md:gap-6">
        <Logo />

        <SearchBar id="buscar-desktop" className="hidden flex-1 md:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={onBranchClick}
            className="flex max-w-[9.5rem] items-center gap-1.5 rounded-full border border-blanco/25 px-3 py-2 text-sm font-semibold hover:bg-blanco/10 sm:max-w-none"
            aria-label={branchName ? `Sucursal: ${branchName}. Cambiar sucursal` : 'Elegir sucursal'}
          >
            <PinIcon width={18} height={18} className="shrink-0 text-hielo" />
            {branchName ? (
              <span className="truncate">{branchName}</span>
            ) : (
              <span className="truncate">
                <span className="sm:hidden">Sucursal</span>
                <span className="hidden sm:inline">Elige sucursal</span>
              </span>
            )}
            <ChevronDownIcon width={16} height={16} className="shrink-0 opacity-70" />
          </button>

          <Link
            to="/carrito"
            className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-blanco/10"
            aria-label={`Carrito, ${cartLabel}`}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="price absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-hielo px-1 text-xs text-cta-ink">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container-page pb-3 md:hidden">
        <SearchBar id="buscar-movil" />
      </div>
    </header>
  )
}
