const tones = {
  success: 'bg-[#DCFCE7] text-[#15803D]',
  warning: 'bg-[#FEF7DA] text-[#D97706]',
  danger: 'bg-[#FDF2F2] text-[#9B2C2C]',
  neutral: 'bg-[#FAF6EF] text-[#78716C] border border-[#E6D9C5]',
  inverse: 'bg-white/20 text-white',
}

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tones[tone]} ${className}`}
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
