import BottomNav from './BottomNav'
import TopNav from './TopNav'
import MobileTopBar from './MobileTopBar'
import Footer from './Footer'

export default function AppShell({ children, maxWidth = 'max-w-md md:max-w-7xl' }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6EF] text-[#1C1917]">
      <MobileTopBar />
      <TopNav />
      <main className="flex-1">
        <div className={`mx-auto pb-20 md:px-6 md:pb-16 ${maxWidth}`}>{children}</div>
      </main>
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>
      <BottomNav />
    </div>
  )
}

