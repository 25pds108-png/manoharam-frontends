import BottomNav from './BottomNav'
import TopNav from './TopNav'
import MobileTopBar from './MobileTopBar'

/**
 * Mobile: a persistent top app bar (logo + cart) plus a fixed bottom tab
 * bar (matches the PWA reference design). Desktop (md+): the top app bar
 * and bottom tabs both hide, replaced by the full TopNav navbar instead.
 */
export default function AppShell({ children, maxWidth = 'max-w-md md:max-w-6xl' }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <MobileTopBar />
      <TopNav />
      <div className={`mx-auto pb-24 md:px-6 md:pb-12 ${maxWidth}`}>{children}</div>
      <BottomNav />
    </div>
  )
}
