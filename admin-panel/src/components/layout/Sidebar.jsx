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
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/recipes', label: 'Recipes', icon: ChefHat },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/subscriptions', label: 'Subscriptions', icon: CalendarCheck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/coupons', label: 'Coupons', icon: Ticket },
  { to: '/reviews', label: 'Reviews', icon: Star },
  { to: '/holidays', label: 'Service Holidays', icon: CalendarOff },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 top-16 z-30 flex w-64 flex-col border-r border-cream-300 bg-white">
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-chili-50 text-chili-500 font-semibold' : 'text-ink-700 hover:bg-cream-100'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cream-200 px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili-500 text-sm font-semibold text-cream-50">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-300">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full p-1.5 text-ink-500 hover:bg-cream-200"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}