import { useQuery } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import { getMyOrders } from '../api/orders'
import { formatStatusLabel } from '../components/ui/Badge'

const STATUS_ICON = {
  PENDING: '🛒',
  CONFIRMED: '✅',
  OUT_FOR_DELIVERY: '🚚',
  DELIVERED: '📦',
  CANCELLED: '❌',
}

const STATUS_MESSAGE = {
  PENDING: "We've received your order and will confirm it shortly.",
  CONFIRMED: "We'll dispatch your order soon.",
  OUT_FOR_DELIVERY: 'Your order is on the way.',
  DELIVERED: 'Your order has been delivered.',
  CANCELLED: 'This order was cancelled.',
}

/**
 * There's no dedicated notifications/alerts API in the backend, so this
 * derives a simple activity feed from order history. It's a reasonable
 * stand-in, but a real notifications table + endpoint would let this also
 * reflect subscription approvals, etc. (as shown in the design reference).
 */
export default function Notifications() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })

  const orders = data?.orders ?? []

  return (
    <AppShell>
      <div className="px-4 pt-6 md:mx-auto md:max-w-2xl md:pt-10">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Notifications</h1>

        {isLoading ? <p className="py-12 text-center text-ink-300">Loading…</p> : null}

        {!isLoading && orders.length === 0 ? (
          <p className="py-12 text-center text-ink-500">Nothing here yet.</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-200 text-lg">
                {STATUS_ICON[order.status] || '📦'}
              </div>
              <div>
                <p className="font-semibold text-ink-900">
                  Order #{order.id} — {formatStatusLabel(order.status)}
                </p>
                <p className="text-sm text-ink-500">
                  {STATUS_MESSAGE[order.status] || ''}
                </p>
                <p className="mt-1 text-xs text-ink-300">
                  {new Date(order.order_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
