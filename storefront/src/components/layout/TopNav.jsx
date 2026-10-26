import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, CalendarCheck, Bell, User, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const links = [
  { to: '/', label: 'Menu', end: true },
  { to: '/subscription', label: 'Plan', icon: CalendarCheck },
  { to: '/orders', label: 'Orders' },
]

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 hidden border-b border-cream-300 bg-cream-50/95 backdrop-blur md:block">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <Link to="/" className="font-display text-xl font-semibold text-chili-500">
          Manoharam Real Foods
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-chili-50 text-chili-500' : 'text-ink-700 hover:bg-cream-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link
  to="/search"
  aria-label="Search products"
  title="Search"
  className="
    ml-auto
    inline-flex h-11 w-11 items-center justify-center
    rounded-full
    border border-slate-200/80
    bg-white/90
    text-slate-600
    shadow-sm
    backdrop-blur
    transition-all duration-200
    hover:border-orange-200
    hover:bg-orange-50
    hover:text-orange-600
    hover:shadow-md
    active:scale-95
    focus:outline-none
    focus:ring-2
    focus:ring-orange-500
    focus:ring-offset-2
  "
>
  <Search className="h-5 w-5" strokeWidth={2.2} />
</Link>

        <Link to="/cart" className="relative rounded-full p-2 hover:bg-cream-200" aria-label="Cart">
          <ShoppingCart className="h-5 w-5 text-ink-700" />
          {itemCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-chili-500 px-1 text-[10px] font-semibold text-cream-50">
              {itemCount}
            </span>
          ) : null}
        </Link>

        <Link to="/notifications" className="rounded-full p-2 hover:bg-cream-200" aria-label="Notifications">
          <Bell className="h-5 w-5 text-ink-700" />
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-pill px-3 py-1.5 hover:bg-cream-200"
            >
              <User className="h-4 w-4 text-ink-700" />
              <span className="text-sm font-medium text-ink-900">{user?.name?.split(' ')[0]}</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full p-2 text-ink-500 hover:bg-cream-200"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-pill bg-chili-500 px-4 py-2 text-sm font-semibold text-cream-50"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  )
}
