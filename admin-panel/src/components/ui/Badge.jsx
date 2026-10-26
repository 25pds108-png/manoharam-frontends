const tones = {
  success: 'bg-success-100 text-success-500',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-500',
  neutral: 'bg-cream-300 text-ink-700',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
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
    PENDING: 'warning',
    OUT_FOR_DELIVERY: 'warning',
    CANCELLED: 'danger',
    INACTIVE: 'danger',
    COMPLETED: 'neutral',
  }
  return map[status] || 'neutral'
}

export function formatStatusLabel(status = '') {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
