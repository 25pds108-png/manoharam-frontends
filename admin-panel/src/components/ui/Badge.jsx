const tones = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-chili-50 text-chili-600 border-chili-200/80',
  info: 'bg-blue-50 text-blue-700 border-blue-200/80',
  neutral: 'bg-cream-200/60 text-ink-700 border-cream-300/80',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none ${tones[tone] || tones.neutral} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === 'success'
            ? 'bg-emerald-500'
            : tone === 'warning'
            ? 'bg-amber-500'
            : tone === 'danger'
            ? 'bg-chili-500'
            : tone === 'info'
            ? 'bg-blue-500'
            : 'bg-ink-400'
        }`}
      />
      {children}
    </span>
  )
}

export function toneForStatus(status) {
  const map = {
    ACTIVE: 'success',
    APPROVED: 'success',
    DELIVERED: 'success',
    CONFIRMED: 'success',
    PAID: 'success',
    PENDING: 'warning',
    OUT_FOR_DELIVERY: 'warning',
    PAUSED: 'warning',
    CANCELLED: 'danger',
    REJECTED: 'danger',
    INACTIVE: 'neutral',
    COMPLETED: 'neutral',
    EXPIRED: 'danger',
  }
  return map[status] || 'neutral'
}

export function formatStatusLabel(status = '') {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
