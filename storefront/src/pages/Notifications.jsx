import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  ArrowRight,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import { getMyOrders } from '../api/orders'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'

function StatusIcon({ status }) {
  switch (status) {
    case 'PENDING':
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-500 border border-warning-200">
          <Clock className="h-5 w-5" />
        </div>
      )
    case 'CONFIRMED':
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-500 border border-success-200">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      )
    case 'OUT_FOR_DELIVERY':
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chili-100 text-chili-600 border border-chili-200">
          <Truck className="h-5 w-5" />
        </div>
      )
    case 'DELIVERED':
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-500 border border-success-200">
          <PackageCheck className="h-5 w-5" />
        </div>
      )
    case 'CANCELLED':
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-100 text-danger-500 border border-danger-200">
          <XCircle className="h-5 w-5" />
        </div>
      )
    default:
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-ink-500 border border-cream-300">
          <Bell className="h-5 w-5" />
        </div>
      )
  }
}

const STATUS_MESSAGE = {
  PENDING: "We've received your order and our traditional kitchen will begin preparation.",
  CONFIRMED: 'Order confirmed and ingredients are being slow-cooked in cold-pressed oil with care.',
  OUT_FOR_DELIVERY: 'Your order is out for delivery — keep your phone handy.',
  DELIVERED: 'Order successfully delivered. Enjoy your wholesome home meal!',
  CANCELLED: 'This order was cancelled.',
}

export default function Notifications() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })

  const orders = data?.orders ?? []

  return (
    <AppShell maxWidth="max-w-2xl">
      <PageHeader
        title="Order & Kitchen Alerts"
        subtitle="Real-time updates on your kitchen preparations and deliveries"
      />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No kitchen alerts yet"
            description="Updates regarding your order confirmation, kitchen dispatch, and home deliveries will appear here."
            actionLabel="Discover Homemade Delicacies"
            onAction={() => (window.location.href = '/')}
          />
        ) : null}

        {!isLoading && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="group block rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-xs transition-all duration-150 hover:border-chili-400 hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <StatusIcon status={order.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-serif text-sm font-bold text-ink-900 group-hover:text-chili-600 transition-colors truncate">
                          Order #{order.id}
                        </p>
                        <Badge status={order.status}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-medium text-ink-400 shrink-0">
                        {new Date(order.order_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
                      {STATUS_MESSAGE[order.status] || 'Order details updated.'}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-chili-600 group-hover:underline">
                      <span>View order details</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
