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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E6D9C5] bg-[#FAF6EF]/95 backdrop-blur-md md:hidden shadow-lg">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-3 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-[#9B2C2C]' : 'text-[#78716C] hover:text-[#1C1917]'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
