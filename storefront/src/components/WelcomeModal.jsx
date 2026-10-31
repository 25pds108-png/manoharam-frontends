import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import logo from '../assets/logo.png'
import Button from './ui/Button'
import { HeritageKolamDivider } from './ui/HeritagePattern'

const SEEN_KEY = 'mrf_welcomed'

export default function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      setOpen(true)
    }
  }, [])

  const close = () => {
    localStorage.setItem(SEEN_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-950/60 p-0 backdrop-blur-xs md:items-center md:p-4"
    >
      <div className="w-full max-w-md rounded-t-3xl border border-cream-300 bg-cream-50 p-6 pb-8 shadow-2xl md:rounded-3xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="rounded-full p-1.5 text-ink-500 hover:bg-cream-200 hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
            aria-label="Close welcome modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center px-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-100 border border-cream-300 p-2 shadow-xs">
            <img
              src={logo}
              alt="Manoharam Real Foods"
              className="h-full w-auto object-contain"
            />
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-300">
              <Sparkles className="h-3 w-3 text-amber-700" />
              Pure Artisanal Heritage
            </span>
          </div>

          <h2 id="welcome-modal-title" className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-ink-900">
            Manoharam Real Foods
          </h2>
          <p className="mt-1 font-serif text-xs italic font-medium text-chili-600">
            “Safe, as your mother&apos;s home.”
          </p>

          <HeritageKolamDivider className="my-3 text-cream-300 opacity-60" />

          <p className="text-xs leading-relaxed text-ink-700">
            Handcrafted South Indian pickles, sun-roasted spices, and wholesome weekly meal plans prepared in small batches with 100% cold-pressed oils and zero chemical preservatives.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="primary"
            className="w-full justify-center text-xs py-3"
            onClick={close}
          >
            Explore Homemade Pickles & Delicacies
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
          <Link to="/subscription" onClick={close} className="w-full">
            <Button
              variant="outline"
              className="w-full justify-center text-xs py-2.5"
            >
              View Weekly Meal Plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
