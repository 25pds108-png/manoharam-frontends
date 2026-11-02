const variants = {
  primary:
    'bg-chili-500 text-cream-50 hover:bg-chili-600 active:bg-chili-700 shadow-xs hover:shadow-sm disabled:bg-chili-300 disabled:cursor-not-allowed',
  secondary:
    'bg-white text-ink-800 border border-cream-300 hover:bg-cream-100 hover:border-cream-400 active:bg-cream-200 shadow-2xs disabled:opacity-50',
  outline:
    'bg-transparent text-chili-600 border border-chili-500 hover:bg-chili-50 active:bg-chili-100 disabled:opacity-50',
  ghost:
    'bg-cream-200/70 text-ink-900 hover:bg-cream-200 active:bg-cream-300 disabled:opacity-50',
  danger:
    'bg-chili-600 text-cream-50 hover:bg-chili-700 active:bg-chili-800 shadow-xs disabled:opacity-50',
  dark:
    'bg-ink-900 text-cream-50 hover:bg-ink-800 active:bg-black shadow-xs disabled:opacity-50',
}

const sizes = {
  sm: 'text-xs min-h-[36px] px-3.5 py-1.5',
  md: 'text-sm min-h-[42px] px-4.5 py-2.5',
  lg: 'text-base min-h-[48px] px-6 py-3',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const isButton = Component === 'button'

  return (
    <Component
      type={isButton ? type : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all select-none cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500/40 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Component>
  )
}
