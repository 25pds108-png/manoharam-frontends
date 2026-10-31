import { ShoppingBag } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = ShoppingBag,
  title = 'No items found',
  description = 'There are currently no records available.',
  actionLabel,
  onAction,
  actionHref,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-cream-300 bg-cream-50 px-6 py-14 text-center max-w-md mx-auto shadow-2xs ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cream-200/60 text-chili-600 border border-cream-300/80 mb-4 shadow-inner">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>

      <h3 className="font-serif text-lg sm:text-xl font-bold text-ink-900">{title}</h3>

      {description ? (
        <p className="mt-1.5 text-xs sm:text-sm text-ink-500 max-w-xs leading-relaxed">
          {description}
        </p>
      ) : null}

      {actionLabel && (onAction || actionHref) ? (
        <div className="mt-6">
          {actionHref ? (
            <Button as="a" href={actionHref} variant="primary">
              {actionLabel}
            </Button>
          ) : (
            <Button onClick={onAction} variant="primary">
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { EmptyState }
