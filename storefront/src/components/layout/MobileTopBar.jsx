import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

/**
 * Mobile-only persistent app bar (logo + name + cart badge), shown above
 * every page's content. TopNav (desktop) already covers this role at the
 * md breakpoint and up, so this hides there to avoid double chrome.
 *
 * Swap the placeholder logo mark below for a real <img> once a logo asset
 * is provided — see the comment in the JSX below. Keep the rounded-full
 * frame + white ring + shadow treatment for consistency with the brand
 * mark used elsewhere (Profile page avatar, etc.).
 */
export default function MobileTopBar() {
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 bg-chili-500 px-4 py-3 shadow-md shadow-chili-900/20 md:hidden">
      <Link to="/" className="flex flex-1 items-center gap-3 overflow-hidden">
        {/* Placeholder logo mark — replace the <span> below with:
            <img src="/logo.png" alt="Manoharam Real Foods"
                 className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-cream-50/80 shadow-sm" />
            once a real logo asset is available. */}
        {/* <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 font-display text-base font-semibold text-chili-500 ring-2 ring-cream-50/40 shadow-sm"> */}
          <img src={logo} alt="logo" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 font-display text-base font-semibold text-chili-500 ring-2 ring-cream-50/40 shadow-sm"/>
        {/* </span> */}
        <span className="truncate font-display text-base font-semibold tracking-tight text-cream-50">
          Manoharam Real Foods
        </span>
      </Link>

      <Link
        to="/cart"
        className="relative shrink-0 rounded-full p-2 text-cream-50 transition-colors hover:bg-white/15"
        aria-label="Cart"
      >
        <ShoppingCart className="h-5 w-5" strokeWidth={2} />
        {itemCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-cream-50 px-1 text-[10px] font-bold text-chili-600 ring-2 ring-chili-500">
            {itemCount}
          </span>
        ) : null}
      </Link>
    </header>
  )
}
