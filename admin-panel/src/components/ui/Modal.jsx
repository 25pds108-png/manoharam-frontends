import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    if (!open) return

    const handleKey = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    const origOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = origOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} max-h-[92dvh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl border border-cream-300/80 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-cream-200 bg-cream-50/70 px-5 py-4 shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold text-ink-900 truncate">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-ink-500 leading-normal">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-cream-200 hover:text-ink-900 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-none space-y-4">
          {children}
        </div>

        {/* Optional Sticky Modal Footer */}
        {footer ? (
          <div className="border-t border-cream-200 bg-cream-50/70 px-5 py-3.5 shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
