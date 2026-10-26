import { NavLink } from 'react-router-dom'
import { Home, CalendarCheck, Bell, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Menu', icon: Home, end: true },
  { to: '/subscription', label: 'Plan', icon: CalendarCheck },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'You', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-chili-500' : 'text-ink-300'
                }`
              }
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
