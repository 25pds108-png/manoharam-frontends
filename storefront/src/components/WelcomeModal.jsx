import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import Button from './ui/Button'

const SEEN_KEY = 'mrf_welcomed'

/**
 * Shown once per browser on first visit (tracked via localStorage, not a
 * backend flag — no account required to see it, and it should never
 * reappear once dismissed). Mount this once, near the top of Home.jsx.
 */
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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-900/50 px-0 backdrop-blur-sm md:items-center md:px-4">
      <div className="w-full max-w-md rounded-t-[2rem] bg-cream-50 p-6 pb-8 shadow-2xl md:rounded-card">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="text-ink-300 transition-colors hover:text-ink-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chili-50 text-3xl">
            🌿
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900">
            Welcome to Manoharam Real Foods
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            Real ingredients, made fresh daily and delivered to your door. Order à la carte, or
            subscribe to a daily salad and never think about lunch again.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button className="w-full" onClick={close}>
            Explore the menu
          </Button>
          <Link to="/subscription" onClick={close}>
            <button className="w-full rounded-pill border border-chili-200 py-3.5 text-sm font-semibold text-chili-500 transition-colors hover:bg-chili-50">
              See daily subscriptions
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
