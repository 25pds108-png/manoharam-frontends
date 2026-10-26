const variants = {
  primary:
    'bg-chili-500 text-cream-50 shadow-md shadow-chili-500/30 hover:bg-chili-600 hover:shadow-lg hover:shadow-chili-500/40 active:bg-chili-700 active:scale-[0.98] disabled:bg-chili-200 disabled:shadow-none',
  outline:
    'bg-transparent text-chili-500 border border-chili-500 hover:bg-chili-50 disabled:opacity-50',
  ghost:
    'bg-cream-200 text-ink-900 hover:bg-cream-300 disabled:opacity-50',
  dark:
    'bg-ink-900 text-cream-50 hover:bg-ink-700 disabled:opacity-50',
}

const sizes = {
  sm: 'text-sm px-4 py-2',
  md: 'text-base px-5 py-3',
  lg: 'text-base px-6 py-4',
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
      className={`inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Component>
  )
}
