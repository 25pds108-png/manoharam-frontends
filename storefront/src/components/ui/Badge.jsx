const tones = {
  success: 'bg-success-100 text-success-500 border border-success-500/20',
  warning: 'bg-warning-100 text-warning-500 border border-warning-500/25',
  danger: 'bg-danger-100 text-danger-500 border border-danger-500/20',
  neutral: 'bg-cream-100 text-ink-500 border border-cream-300',
  amber: 'bg-amber-100 text-amber-700 border border-amber-300',
  chili: 'bg-chili-100 text-chili-600 border border-chili-200',
  inverse: 'bg-cream-50/20 text-cream-50 backdrop-blur-xs border border-cream-50/30',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${tones[tone] || tones.neutral} ${className}`}
    >
      {children}
    </span>
  )
}

/** Maps backend order/subscription status strings to a Badge tone. */
export function toneForStatus(status) {
  const map = {
    ACTIVE: 'success',
    APPROVED: 'success',
    DELIVERED: 'success',
    CONFIRMED: 'success',
    PENDING: 'warning',
    OUT_FOR_DELIVERY: 'amber',
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
