/**
 * Kolam/Rangoli geometric decorative motifs.
 * Rendered at low opacity using locked cream/amber tokens to give the storefront
 * an artisanal South Indian heritage signature. Purely decorative.
 */
export function HeritageKolamDivider({ className = '' }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-cream-300 py-3 select-none ${className}`}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className="opacity-70 text-cream-400"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
    </div>
  )
}

export function HeritageCornerFlourish({ className = '' }) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      className={`text-cream-300/60 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="24" cy="6" r="1.5" />
      <circle cx="6" cy="24" r="1.5" />
    </svg>
  )
}

export const HeritageDivider = HeritageKolamDivider

