import { Link } from 'react-router-dom'
import { ShoppingCart, Search } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

export default function MobileTopBar() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 md:hidden shadow-xs">
      {/* Mobile Top Tagline Strip */}
      <div className="bg-[#9B2C2C] px-3 py-1 text-center">
        <p className="font-serif text-[11px] italic tracking-wide text-[#FAF6EF]">
          “Safe, as your mother's home.”
        </p>
      </div>

      {/* Main Mobile App Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E6D9C5] bg-[#FAF6EF]/95 px-3.5 py-2.5 backdrop-blur-md">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="h-10 w-auto shrink-0 object-contain"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-lg font-bold tracking-tight text-[#1C1917] leading-tight truncate">
              Manoharam
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9B2C2C] leading-none">
              Real Foods
            </span>
          </div>
        </Link>

        {/* Action Buttons: Search & Cart */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] shadow-xs active:scale-95"
            aria-label="Search"
          >
            <Search className="h-4 w-4" strokeWidth={2} />
          </Link>

          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] shadow-xs active:scale-95"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#9B2C2C] px-1 text-[10px] font-bold text-white shadow-xs">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}

