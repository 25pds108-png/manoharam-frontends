export default function PageHeader({ title, description, action, breadcrumb }) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumb ? <div className="text-xs text-ink-500">{breadcrumb}</div> : null}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-950 tracking-tight break-words">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-xs sm:text-sm text-ink-500 leading-relaxed max-w-3xl">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex flex-wrap items-center gap-2 shrink-0">{action}</div> : null}
      </div>
    </div>
  )
}
