import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

/**
 * Mobile: circular back button + centered title (matches the phone mockups).
 * Desktop: TopNav already provides navigation, so this collapses to a plain
 * left-aligned heading with no back button — clicking around via the navbar
 * is the desktop pattern, not browser-style back buttons floating in content.
 */
export default function PageHeader({ title, onBack, fallbackPath = '/', right = null }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) return onBack()
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate(fallbackPath)
    }
  }

  return (
    <header className="flex items-center gap-3 px-4 pt-6 pb-2 md:pt-8">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm shadow-ink-900/5 md:hidden"
      >
        <ChevronLeft className="h-5 w-5 text-ink-900" />
      </button>
      <h1 className="flex-1 text-center font-display text-xl font-semibold text-ink-900 md:text-left md:text-2xl">
        {title}
      </h1>
      <div className="h-10 w-10 shrink-0 md:hidden">{right}</div>
    </header>
  )
}
