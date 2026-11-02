import { Link } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onOpenMobileNav }) {
  const { user } = useAuth()

  const initials = (user?.name || 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-chili-500 px-3.5 sm:px-6 shadow-md shadow-chili-900/20">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile & Tablet Hamburger Toggle */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-cream-50 hover:bg-chili-600 active:bg-chili-700 lg:hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-50/70"
        >
          <Menu className="h-5 w-5" strokeWidth={2.2} />
        </button>

        {/* Brand Lockup */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 font-display text-base font-bold text-chili-500 ring-2 ring-cream-50/40 shadow-sm transition-transform group-hover:scale-105">
            M
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm sm:text-base font-bold text-cream-50 tracking-tight">
              Manoharam Real Foods
            </p>
            <p className="text-[11px] text-cream-50/80 font-medium">Operations Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Right Side Status & User pill */}
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-chili-600/70 border border-cream-50/15 px-3 py-1 text-xs font-semibold text-cream-50 shadow-xs">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
          <span>Admin Console</span>
        </span>

        {user ? (
          <div className="flex items-center gap-2 rounded-full bg-cream-50/10 py-1 pl-1 pr-2.5 text-cream-50 border border-cream-50/20">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-50 text-xs font-bold text-chili-600 shadow-xs">
              {initials}
            </div>
            <span className="hidden md:inline-block text-xs font-medium max-w-[120px] truncate text-cream-50">
              {user.name}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  )
}
