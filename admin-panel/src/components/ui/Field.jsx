export default function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  as = 'input',
  prefix,
  suffix,
  className = '',
  children,
  ...inputProps
}) {
  const Component = as

  const baseInputStyles = `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 transition-colors placeholder:text-ink-300 outline-none ${
    error
      ? 'border-chili-400 focus:border-chili-500 focus:ring-2 focus:ring-chili-500/20'
      : 'border-cream-300 hover:border-cream-400 focus:border-chili-500 focus:ring-2 focus:ring-chili-500/15'
  } ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''} ${className}`

  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-ink-800">
            {label}
            {required ? <span className="text-chili-500 ml-0.5">*</span> : null}
          </label>
          {optional ? (
            <span className="text-[11px] font-normal text-ink-400">Optional</span>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-ink-400">
            {prefix}
          </span>
        ) : null}

        {as === 'select' ? (
          <select {...inputProps} className={baseInputStyles}>
            {children}
          </select>
        ) : as === 'textarea' ? (
          <textarea {...inputProps} className={baseInputStyles} />
        ) : (
          <Component {...inputProps} className={baseInputStyles} />
        )}

        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-ink-400">
            {suffix}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-medium text-chili-600 flex items-center gap-1">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500 leading-normal">{hint}</p>
      ) : null}
    </div>
  )
}
