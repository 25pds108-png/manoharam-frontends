import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ChefHat,
  ClipboardList,
  CalendarCheck,
  Boxes,
  Users,
  Ticket,
  Star,
  CalendarOff,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/recipes', label: 'Recipes & Nutrition', icon: ChefHat },
  { to: '/inventory', label: 'Inventory Batches', icon: Boxes },
  { to: '/orders', label: 'Store Orders', icon: ClipboardList },
  { to: '/subscriptions', label: 'Subscriptions', icon: CalendarCheck },
  { to: '/customers', label: 'Customer Accounts', icon: Users },
  { to: '/coupons', label: 'Coupons & Offers', icon: Ticket },
  { to: '/reviews', label: 'Reviews & Feedback', icon: Star },
  { to: '/holidays', label: 'Service Holidays', icon: CalendarOff },
]

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    if (onClose) onClose()
    logout()
    navigate('/login')
  }

  // Prevent background scrolling when mobile drawer is open & handle ESC key
  useEffect(() => {
    if (!mobileOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen, onClose])

  const initials = (user?.name || 'Admin')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const navContent = (
    <>
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-none">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
          Main Management
        </p>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-chili-50 text-chili-600 font-semibold shadow-xs ring-1 ring-chili-200/50'
                  : 'text-ink-700 hover:bg-cream-100/80 active:bg-cream-200'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0 stroke-[2.2]" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cream-200 bg-cream-50/50 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5 border border-cream-300/80 shadow-xs">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili-500 text-xs font-bold text-cream-50 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink-900">{user?.name || 'Administrator'}</p>
            <p className="truncate text-[11px] text-ink-500">{user?.email || 'admin@manoharam.com'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-500 hover:bg-chili-50 hover:text-chili-600 transition-colors"
            title="Log out"
            aria-label="Log out of admin panel"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* 1. Permanent Desktop Sidebar (Screen width >= 1024px) */}
      <aside className="fixed inset-y-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-cream-300 bg-white lg:flex">
        {navContent}
      </aside>

      {/* 2. Mobile & Tablet Slide-in Drawer (Screen width < 1024px) */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
            className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200"
          >
            {/* Drawer Topbar */}
            <div className="flex h-16 items-center justify-between border-b border-cream-200 bg-chili-500 px-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 font-display text-sm font-bold text-chili-500 shadow-xs">
                  M
                </span>
                <span className="font-display text-sm font-bold text-cream-50">
                  Manoharam Admin
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-cream-50 hover:bg-chili-600 active:bg-chili-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation & User */}
            {navContent}
          </aside>
        </div>
      ) : null}
    </>
  )
}