import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, CalendarCheck, Bell, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import logo from '../../assets/logo.png'

const links = [
  { to: '/', label: 'Our Menu & Pickles', end: true },
  { to: '/subscription', label: 'Weekly Plans', icon: CalendarCheck },
  { to: '/orders', label: 'My Orders' },
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
    <header className="sticky top-0 z-40 hidden border-b border-[#E6D9C5] bg-[#FAF6EF]/95 backdrop-blur-md md:block shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#9B2C2C] px-4 py-1.5 text-center text-xs font-medium text-[#FAF6EF] tracking-wide">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-[#FDEBB2]">
            <Sparkles className="h-3 w-3 text-[#FDEBB2]" />
            Small-Batch Kitchen Craft
          </span>
          <p className="font-serif text-xs italic tracking-wider text-[#FAF6EF]">
            “Safe, as your mother's home.”
          </p>
          <span className="text-[11px] text-[#FDEBB2]/90 hidden lg:inline">
            100% Cold-Pressed Oils • Zero Chemical Preservatives
          </span>
        </div>
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
            <span className="font-serif text-xl font-bold tracking-tight text-[#1C1917] leading-none group-hover:text-[#9B2C2C] transition-colors">
              Manoharam
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9B2C2C] mt-0.5">
              Real Foods
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="flex items-center gap-1.5">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#FCE4E4] text-[#9B2C2C] shadow-xs'
                    : 'text-[#44403C] hover:bg-[#F3EBDD] hover:text-[#1C1917]'
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/40 hover:bg-[#FDF2F2] hover:text-[#9B2C2C] focus:ring-2 focus:ring-[#9B2C2C]/20"
          >
            <Search className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>

          {/* Cart Icon with Counter */}
          <Link
            to="/cart"
            aria-label="Shopping Cart"
            title="Cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/40 hover:bg-[#FDF2F2] hover:text-[#9B2C2C] focus:ring-2 focus:ring-[#9B2C2C]/20"
          >
            <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2} />
            {itemCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9B2C2C] px-1 text-[11px] font-bold text-white shadow-xs">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {/* Notifications */}
          <Link
            to="/notifications"
            aria-label="Notifications"
            title="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/40 hover:bg-[#FDF2F2] hover:text-[#9B2C2C]"
          >
            <Bell className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>

          <div className="h-5 w-px bg-[#E6D9C5]" />

          {/* User Profile or Log In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-[#E6D9C5] bg-[#FFFEFC] py-1.5 pl-2 pr-3.5 shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/40 hover:bg-[#FDF2F2]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B2C2C] text-xs font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-[#1C1917] max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#78716C] hover:bg-[#F3EBDD] hover:text-[#9B2C2C] transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-md bg-[#9B2C2C] px-5 py-2 text-sm font-semibold text-white shadow-xs transition-all duration-150 hover:bg-[#7B1F23] focus:ring-2 focus:ring-[#9B2C2C]/30"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

