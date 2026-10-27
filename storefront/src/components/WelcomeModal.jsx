import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import logo from '../assets/logo.png'

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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-0 backdrop-blur-xs md:items-center md:p-4">
      <div className="w-full max-w-md rounded-t-2xl border border-[#E6D9C5] bg-[#FFFEFC] p-6 pb-8 shadow-2xl md:rounded-2xl">
        <div className="flex justify-end">
          <button
            onClick={close}
            className="rounded-full p-1 text-[#78716C] hover:bg-[#FAF6EF] hover:text-[#1C1917] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-center">
          <img
            src={logo}
            alt="Manoharam Real Foods"
            className="mx-auto h-16 w-auto object-contain"
          />
          <h2 className="mt-3 font-serif text-2xl font-bold text-[#1C1917]">
            Manoharam Real Foods
          </h2>
          <p className="mt-1 font-serif text-xs italic font-medium text-[#9B2C2C]">
            “Safe, as your mother's home.”
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#78716C]">
            Handcrafted South Indian pickles, sun-roasted spices, and healthy weekly meal plans prepared in small batches with 100% cold-pressed oils and zero chemical preservatives.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            className="w-full rounded-md bg-[#9B2C2C] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23] transition-colors"
            onClick={close}
          >
            Explore Homemade Pickles & Delicacies
          </button>
          <Link to="/subscription" onClick={close}>
            <button className="w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] py-2.5 text-xs font-bold text-[#44403C] hover:bg-[#F3EBDD] transition-colors">
              View Weekly Meal Plans
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
