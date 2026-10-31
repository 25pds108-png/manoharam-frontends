import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Receipt, ChevronRight, PackageCheck } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { getMyOrders } from '../api/orders'

export default function Orders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: getMyOrders,
  })

  const orders = data?.orders ?? []

  return (
    <AppShell maxWidth="max-w-4xl">
      <PageHeader title="My Orders & Tracking" />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6 lg:px-8 space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
            <p className="mt-4 text-xs font-semibold text-ink-500">Loading your orders…</p>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-chili-200 bg-chili-50 p-6 text-center">
            <p className="font-serif text-base font-bold text-chili-600">Couldn't load your orders</p>
            <p className="mt-1 text-xs text-ink-500">Please refresh the page and try again.</p>
          </div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Receipt}
              title="No orders placed yet"
              description="When you order handcrafted pickles or subscribe to meals, you can track their kitchen preparation and delivery right here."
              actionLabel="Explore Our Menu"
              actionHref="/"
            />
          </div>
        ) : null}

        <div className="space-y-3.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block rounded-2xl border border-cream-300 bg-cream-50 p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-chili-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-chili-600 border border-cream-300">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-serif text-base font-bold text-ink-900 group-hover:text-chili-600 transition-colors">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {new Date(order.order_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-serif text-base font-bold text-chili-600 tabular-nums">
                      ₹{Number(order.total_amount).toFixed(0)}
                    </p>
                    <Badge tone={toneForStatus(order.status)} className="mt-1">
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-chili-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
