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
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6D9C5] bg-[#FFFEFC] text-[#1C1917] shadow-xs hover:bg-[#FAF6EF] active:scale-95 transition-all md:hidden"
      >
        <ChevronLeft className="h-4.5 w-4.5" />
      </button>
      <h1 className="flex-1 font-serif text-xl font-bold text-[#1C1917] md:text-2xl text-left truncate">
        {title}
      </h1>
      <div className="shrink-0">{right}</div>
    </header>
  )
}
