import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import { getMyOrders } from '../api/orders'
import { formatStatusLabel } from '../components/ui/Badge'

function StatusIcon({ status }) {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-5 w-5 text-[#D97706]" />
    case 'CONFIRMED':
      return <CheckCircle2 className="h-5 w-5 text-[#15803D]" />
    case 'OUT_FOR_DELIVERY':
      return <Truck className="h-5 w-5 text-[#9B2C2C]" />
    case 'DELIVERED':
      return <PackageCheck className="h-5 w-5 text-[#15803D]" />
    case 'CANCELLED':
      return <XCircle className="h-5 w-5 text-[#9B2C2C]" />
    default:
      return <Bell className="h-5 w-5 text-[#78716C]" />
  }
}

const STATUS_MESSAGE = {
  PENDING: "We've received your order and our kitchen will begin preparation.",
  CONFIRMED: 'Order confirmed and ingredients are being slow-cooked with care.',
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
      <PageHeader title="Order & Delivery Alerts" />

      <div className="px-4 py-4 sm:px-6">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading alerts…</p>
          </div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center max-w-md mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF6EF] text-[#78716C] border border-[#E6D9C5]">
              <Bell className="h-7 w-7" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-bold text-[#1C1917]">
              No notifications yet
            </h2>
            <p className="mt-1 text-xs text-[#78716C]">
              Updates regarding order confirmation, kitchen dispatch, and deliveries will appear here.
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/30 hover:shadow-md"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF6EF] border border-[#E6D9C5]/80">
                  <StatusIcon status={order.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors">
                      Order #{order.id} — {formatStatusLabel(order.status)}
                    </p>
                    <span className="text-[11px] text-[#A8A29E]">
                      {new Date(order.order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
                    {STATUS_MESSAGE[order.status] || ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
