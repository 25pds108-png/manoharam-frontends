export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-cream-300/80 bg-white shadow-xs transition-shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
