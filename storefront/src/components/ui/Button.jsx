const variants = {
  primary:
    'bg-[#9B2C2C] text-white shadow-xs hover:bg-[#7B1F23] active:scale-[0.98] disabled:opacity-50',
  secondary:
    'border border-[#E6D9C5] bg-[#FFFEFC] text-[#1C1917] hover:border-[#9B2C2C]/30 hover:bg-[#FAF6EF]',
  outline:
    'border border-[#9B2C2C] bg-transparent text-[#9B2C2C] hover:bg-[#FDF2F2] disabled:opacity-50',
  ghost:
    'bg-[#FAF6EF] text-[#44403C] hover:bg-[#F3EBDD] disabled:opacity-50',
  dark:
    'bg-[#1C1917] text-[#FAF6EF] hover:bg-[#44403C] disabled:opacity-50',
}

const sizes = {
  sm: 'text-xs px-3.5 py-1.5',
  md: 'text-xs sm:text-sm px-5 py-2.5',
  lg: 'text-sm sm:text-base px-6 py-3',
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
      className={`inline-flex items-center justify-center gap-2 rounded-md font-bold transition-all duration-150 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Component>
  )
}
