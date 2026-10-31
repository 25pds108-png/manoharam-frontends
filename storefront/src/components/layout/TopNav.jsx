import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, CalendarCheck, Bell, LogOut, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

const links = [
  { to: '/', label: 'Shop Food', end: true, icon: UtensilsCrossed },
  { to: '/subscription', label: 'Meal Plans', icon: CalendarCheck },
  { to: '/orders', label: 'My Orders' },
]

export default function TopNav() {
  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const [bumping, setBumping] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (itemCount > 0) {
      setBumping(true)
      const t = setTimeout(() => setBumping(false), 350)
      return () => clearTimeout(t)
    }
  }, [itemCount])

  const handleSignOut = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-40 hidden border-b md:block transition-all duration-300 ${
        scrolled
          ? 'border-cream-300/90 bg-cream-100/98 shadow-md backdrop-blur-md'
          : 'border-cream-300 bg-cream-100/90 shadow-2xs backdrop-blur-sm'
      }`}
    >
      {/* Top Heritage Announcement Ribbon */}
      <div className="bg-ink-950 px-6 py-1.5 text-center text-[11px] font-medium text-cream-200 tracking-wider">
        <span className="text-amber-400 font-bold">100% Wood-Pressed Oils</span>
        <span className="mx-2 text-cream-400/40">·</span>
        <span>Artisanal Small Batches</span>
        <span className="mx-2 text-cream-400/40">·</span>
        <span>Zero Chemical Preservatives</span>
        <span className="mx-2 text-cream-400/40">·</span>
        <span className="italic text-amber-200 font-serif font-semibold">“Safe, as your mother&apos;s home.”</span>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3.5 group shrink-0">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-ink-900 leading-none group-hover:text-chili-600 transition-colors">
              Manoharam
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-chili-600 mt-1">
              Real Foods
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1.5 rounded-full border border-cream-300/80 bg-cream-50/70 p-1 shadow-xs">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-chili-600 text-cream-50 shadow-xs'
                    : 'text-ink-700 hover:bg-cream-200/70 hover:text-ink-950'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <Link
            to="/search"
            aria-label="Search products"
            title="Search dishes & pickles"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-xs transition-all duration-150 hover:border-chili-300 hover:bg-chili-50 hover:text-chili-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>

          {/* Cart Icon with Counter */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            title="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-xs transition-all duration-150 hover:border-chili-300 hover:bg-chili-50 hover:text-chili-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
          >
            <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2} />
            {itemCount > 0 ? (
              <span
                className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-chili-600 px-1 text-[11px] font-bold text-cream-50 shadow-xs ${
                  bumping ? 'animate-cart-bump' : ''
                }`}
              >
                {itemCount}
              </span>
            ) : null}
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            aria-label="Notifications"
            title="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-700 shadow-xs transition-all duration-150 hover:border-chili-300 hover:bg-chili-50 hover:text-chili-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>

          <div className="h-5 w-px bg-cream-300" />

          {/* User Profile or Log In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 py-1.5 pl-2 pr-3.5 shadow-xs transition-all duration-150 hover:border-chili-300 hover:bg-chili-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-chili-600 text-xs font-bold text-cream-50">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-ink-900 max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink-500 hover:bg-cream-200 hover:text-chili-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg bg-chili-600 px-5 py-2 text-sm font-semibold text-cream-50 shadow-xs transition-all duration-150 hover:bg-chili-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

