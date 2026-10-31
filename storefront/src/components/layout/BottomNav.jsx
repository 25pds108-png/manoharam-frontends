import { NavLink } from 'react-router-dom'
import { Utensils, CalendarCheck, Bell, User } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Menu', icon: Utensils, end: true },
  { to: '/subscription', label: 'Plans', icon: CalendarCheck },
  { to: '/notifications', label: 'Alerts', icon: Bell },
  { to: '/profile', label: 'Account', icon: User },
]

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300 bg-cream-100/95 backdrop-blur-md md:hidden shadow-lg">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-3 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `group relative flex min-h-[48px] flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-chili-600' : 'text-ink-500 hover:text-ink-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5 transition-transform duration-150 group-active:scale-90" strokeWidth={2.2} />
                  <span>{label}</span>
                  {isActive ? (
                    <span className="absolute bottom-1 h-1 w-5 rounded-full bg-chili-600" />
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
