import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  // Auto-close mobile drawer whenever route changes
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-cream-100 text-ink-900 selection:bg-chili-100 selection:text-chili-900 overflow-x-hidden">
      <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <main className="min-h-screen lg:pl-64 pt-16 transition-all duration-200">
        <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
