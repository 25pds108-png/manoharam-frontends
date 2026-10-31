const variants = {
  primary:
    'bg-chili-600 text-cream-50 shadow-xs hover:bg-chili-700 active:scale-[0.98] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-chili-500/30',
  secondary:
    'border border-cream-300 bg-cream-50 text-ink-900 shadow-2xs hover:border-chili-600/30 hover:bg-cream-100 active:scale-[0.98] disabled:opacity-50',
  outline:
    'border border-chili-600 bg-transparent text-chili-600 hover:bg-chili-50 disabled:opacity-50 active:scale-[0.98]',
  ghost:
    'bg-transparent text-ink-700 hover:bg-cream-200/60 hover:text-ink-900 disabled:opacity-50 active:scale-[0.98]',
  dark:
    'bg-ink-900 text-cream-50 hover:bg-ink-950 disabled:opacity-50 active:scale-[0.98]',
  amber:
    'bg-amber-500 text-cream-50 hover:bg-amber-600 disabled:opacity-50 active:scale-[0.98]',
}

const sizes = {
  xs: 'text-xs px-2.5 py-1 rounded-md min-h-[32px]',
  sm: 'text-xs px-3.5 py-1.5 rounded-lg min-h-[38px]',
  md: 'text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg min-h-[42px]',
  lg: 'text-sm sm:text-base px-6 py-3 rounded-xl min-h-[48px]',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 disabled:cursor-not-allowed select-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </Component>
  )
}
