export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-card bg-white shadow-sm shadow-ink-900/5 ${className}`} {...props}>
      {children}
    </div>
  )
}
