export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
