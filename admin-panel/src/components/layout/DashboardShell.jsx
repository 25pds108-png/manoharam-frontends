import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-cream-100">
      <Topbar />
      <Sidebar />
      <main className="ml-64 min-h-screen px-8 py-8 pt-24">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
