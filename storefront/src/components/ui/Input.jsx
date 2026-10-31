import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    as = 'input',
    className = '',
    id,
    children,
    ...props
  },
  ref
) {
  const Component = as
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className="w-full space-y-1.5 text-left">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-ink-700"
        >
          {label}
        </label>
      ) : null}

      <div className="relative flex items-center">
        {Icon ? (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-ink-400">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}

        <Component
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border bg-cream-50 px-3.5 py-2.5 text-xs sm:text-sm text-ink-900 placeholder:text-ink-300 transition-colors duration-150 outline-none focus:border-chili-500 focus:bg-cream-50 focus:ring-1 focus:ring-chili-500/20 disabled:cursor-not-allowed disabled:bg-cream-200/50 disabled:opacity-60 ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-chili-400 focus:border-chili-500' : 'border-cream-300'} ${className}`}
          {...props}
        >
          {children}
        </Component>
      </div>

      {error ? (
        <p className="text-xs font-semibold text-chili-600 animate-toast">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
