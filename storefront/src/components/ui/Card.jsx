export default function Card({
  hoverable = false,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`rounded-2xl border border-cream-300 bg-cream-50 shadow-2xs transition-all duration-200 ${
        hoverable ? 'hover:-translate-y-0.5 hover:border-chili-600/30 hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
