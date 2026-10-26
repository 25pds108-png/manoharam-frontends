import { Link } from 'react-router-dom'

/**
 * Sits above the sidebar+content area, full width. Chili-pepper red to
 * match the storefront's MobileTopBar — same round logo treatment so the
 * two apps feel like one product family.
 *
 * Swap the placeholder <span> below for a real <img> once a logo asset is
 * available, same as storefront/src/components/layout/MobileTopBar.jsx.
 */
export default function Topbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 bg-chili-500 px-6 shadow-md shadow-chili-900/20">
      <Link to="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-50 font-display text-base font-semibold text-chili-500 ring-2 ring-cream-50/40 shadow-sm">
          M
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-cream-50">
            Manoharam Real Foods
          </p>
          <p className="text-xs text-cream-50/75">Admin panel</p>
        </div>
      </Link>
    </header>
  )
}
