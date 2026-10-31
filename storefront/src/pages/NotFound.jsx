import { Link } from 'react-router-dom'
import { UtensilsCrossed, Search, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'
import { HeritageDivider } from '../components/ui/HeritagePattern'

export default function NotFound() {
  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-lg rounded-2xl border border-cream-300 bg-cream-50 p-8 sm:p-12 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chili-100 text-chili-600">
            <UtensilsCrossed className="h-8 w-8" strokeWidth={1.75} />
          </div>

          <span className="mt-6 inline-block font-serif text-sm font-bold uppercase tracking-widest text-amber-500">
            404 Error — Page Not Found
          </span>

          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            This Delicacy Isn't On The Shelf
          </h1>

          <HeritageDivider className="my-4 text-cream-300" />

          <p className="font-serif text-xs italic text-chili-600">
            “Safe, as your mother's home.”
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            The page you are looking for may have been moved, renamed, or is temporarily simmering in our kitchen. Explore our menu to find handcrafted pickles, podis, and home-style meal plans.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                <span>Explore Menu</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/search" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4" />
                <span>Search Dishes</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
