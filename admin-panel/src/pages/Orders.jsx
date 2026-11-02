import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, ArrowRight, Filter } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import { useCursorList } from '../hooks/useCursorList'
import { listOrders } from '../api/orders'

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
]

export default function Orders() {
  const { items: orders, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCursorList({ queryKey: ['orders'], queryFn: listOrders, itemsKey: 'orders' })

  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredOrders = useMemo(() => {
    let result = orders

    if (statusFilter !== 'ALL') {
      result = result.filter(
        (o) => String(o.status).toUpperCase() === statusFilter
      )
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (o) =>
          String(o.id).includes(q) ||
          o.customer_name?.toLowerCase().includes(q)
      )
    }

    return result
  }, [orders, search, statusFilter])

  return (
    <DashboardShell>
      <PageHeader
        title="Customer Orders"
        description="Inspect storefront retail orders, track delivery progression, and manage fulfillments."
      />

      {/* Search and Status Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search by Order ID or customer name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-pill border border-cream-300 bg-white py-2 pl-10 pr-4 text-xs text-ink-900 placeholder:text-ink-400 outline-none focus:border-chili-400 shadow-2xs"
            />
          </div>

          <p className="text-xs text-ink-500 self-center">
            Showing <strong>{filteredOrders.length}</strong> order{filteredOrders.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => {
            const isActive = statusFilter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-chili-500 text-white shadow-xs'
                    : 'bg-white text-ink-700 border border-cream-300 hover:bg-cream-50'
                }`}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 text-xs">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="cursor-pointer hover:bg-cream-50/70 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-chili-600">
                    #{order.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-ink-900">
                    {order.customer_name}
                  </td>
                  <td className="py-3 px-4 text-ink-600">
                    {new Date(order.order_date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-ink-900">
                    ₹{Number(order.total_amount).toFixed(0)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge tone={toneForStatus(order.status)}>
                      {formatStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-chili-500 hover:text-chili-600">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="divide-y divide-cream-100 md:hidden">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="cursor-pointer p-4 hover:bg-cream-50 transition-colors space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-chili-600 text-sm">#{order.id}</span>
                  <h3 className="font-semibold text-ink-900 mt-0.5">{order.customer_name}</h3>
                </div>
                <Badge tone={toneForStatus(order.status)}>
                  {formatStatusLabel(order.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-cream-100 text-ink-600">
                <span>
                  {new Date(order.order_date).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="text-sm font-bold text-ink-900">
                  ₹{Number(order.total_amount).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {isLoading && orders.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-400">Loading orders…</div>
        )}

        {isError && (
          <div className="py-12 text-center text-sm text-chili-500">
            Couldn't load customer orders. Please try again.
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description={
              search || statusFilter !== 'ALL'
                ? 'Try adjusting your search query or status filter.'
                : 'Customer orders will appear here once placed on the storefront.'
            }
          />
        )}
      </Card>

      {hasNextPage && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            loading={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading more orders…' : 'Load More Orders'}
          </Button>
        </div>
      )}
    </DashboardShell>
  )
}
