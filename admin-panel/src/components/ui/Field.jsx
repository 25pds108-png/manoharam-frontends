export default function Field({ label, hint, as = 'input', children, ...inputProps }) {
  const Component = as

  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-sm font-medium text-ink-700">{label}</label>
      ) : null}
      {as === 'select' ? (
        <select
          {...inputProps}
          className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400"
        >
          {children}
        </select>
      ) : (
        <Component
          {...inputProps}
          className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400"
        />
      )}
      {hint ? <p className="mt-1 text-xs text-ink-300">{hint}</p> : null}
    </div>
  )
}
