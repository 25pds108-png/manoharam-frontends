import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Receipt, ChevronRight, PackageCheck, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
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

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading your orders…</p>
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-[#F9C5C5] bg-[#FDF2F2] p-6 text-center">
            <p className="font-serif text-sm font-bold text-[#9B2C2C]">Couldn't load your orders</p>
            <p className="mt-1 text-xs text-[#78716C]">Please refresh the page and try again.</p>
          </div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center max-w-md mx-auto">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE4E4] text-[#9B2C2C] shadow-inner">
              <Receipt className="h-9 w-9 stroke-[1.5]" />
            </div>
            <h2 className="mt-5 font-serif text-2xl font-bold text-[#1C1917]">
              No orders placed yet
            </h2>
            <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
              When you order handcrafted pickles or subscribe to meals, you can track their kitchen preparation and delivery right here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#9B2C2C] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
            >
              <span>Explore Our Pickles & Menu</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}

        <div className="space-y-3.5">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="group block rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FAF6EF] text-[#9B2C2C] border border-[#E6D9C5]/80">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-[#78716C] mt-0.5">
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
                    <p className="font-serif text-base font-bold text-[#9B2C2C]">
                      ₹{Number(order.total_amount).toFixed(0)}
                    </p>
                    <Badge tone={toneForStatus(order.status)} className="mt-0.5">
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#A8A29E] group-hover:text-[#9B2C2C] group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
