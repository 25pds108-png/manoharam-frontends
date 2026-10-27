import { Link } from 'react-router-dom'
import { ShoppingCart, Search } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

export default function MobileTopBar() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 md:hidden shadow-xs border-b border-[#E6D9C5] bg-[#FAF6EF]/95 backdrop-blur-md">
      {/* Main Mobile App Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2 overflow-hidden group">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="h-9 w-auto shrink-0 object-contain"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-base font-bold tracking-tight text-[#1C1917] leading-tight truncate">
              Manoharam Real Foods
            </span>
            <span className="font-serif text-[10px] italic text-[#9B2C2C] leading-none">
              “Safe, as your mother's home.”
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

