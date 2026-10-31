import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Search } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

export default function MobileTopBar() {
  const { itemCount } = useCart()
  const [bumping, setBumping] = useState(false)

  useEffect(() => {
    if (itemCount > 0) {
      setBumping(true)
      const t = setTimeout(() => setBumping(false), 350)
      return () => clearTimeout(t)
    }
  }, [itemCount])

  return (
    <header className="sticky top-0 z-40 md:hidden border-b border-cream-300 bg-cream-100/95 backdrop-blur-md shadow-xs">
      {/* Main Mobile App Bar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden group min-h-[44px]">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="h-10 w-auto shrink-0 object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-base font-bold tracking-tight text-ink-900 leading-tight truncate group-hover:text-chili-600 transition-colors">
              Manoharam Real Foods
            </span>
            <span className="font-serif text-[10px] italic text-chili-600 leading-none">
              “Safe, as your mother's home.”
            </span>
          </div>
        </Link>

        {/* Action Buttons: Search & Cart */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/search"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-xs transition-transform active:scale-95 hover:border-chili-300 hover:text-chili-600"
            aria-label="Search delicacies and meal plans"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>

          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-xs transition-transform active:scale-95 hover:border-chili-300 hover:text-chili-600"
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2} />
            {itemCount > 0 ? (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-chili-600 px-1 text-[10px] font-bold text-cream-50 shadow-xs ${
                  bumping ? 'animate-cart-bump' : ''
                }`}
              >
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}

