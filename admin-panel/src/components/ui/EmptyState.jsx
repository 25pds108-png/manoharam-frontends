import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl border-2 border-dashed border-cream-300 bg-white/60 p-8 sm:p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      {Icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-chili-600 mb-4 shadow-2xs">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
      ) : null}
      <h3 className="font-display text-base sm:text-lg font-bold text-ink-900">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-ink-500 leading-relaxed">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
