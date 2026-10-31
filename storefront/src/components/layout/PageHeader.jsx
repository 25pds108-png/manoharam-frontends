import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

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
    <header className="flex items-center gap-3 px-4 pt-5 pb-3 md:px-0 md:pt-6">
      <button
        type="button"
        onClick={handleBack}
        aria-label="Go back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-900 shadow-xs hover:bg-cream-100 active:scale-95 transition-all md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <h1 className="flex-1 font-serif text-xl font-bold text-ink-900 md:text-3xl text-left truncate">
        {title}
      </h1>
      <div className="shrink-0">{right}</div>
    </header>
  )
}
