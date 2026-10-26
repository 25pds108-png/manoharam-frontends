import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import ProductImage from '../components/ui/ProductImage'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getOrderDetails, updateOrderStatus } from '../api/orders'
import { getApiErrorMessage } from '../api/client'

// Mirrors update_order_status.php's $allowedStatuses exactly.
const STATUS_OPTIONS = ['CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

// The backend rejects status changes once an order is DELIVERED or CANCELLED.
const LOCKED_STATUSES = ['DELIVERED', 'CANCELLED']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderDetails(id),
  })

  const [pendingStatus, setPendingStatus] = useState('')
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const order = data?.order

  const handleUpdateStatus = async () => {
    if (!pendingStatus) return
    setError(null)
    setIsUpdating(true)
    try {
      const result = await updateOrderStatus({ orderId: id, status: pendingStatus })
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['order', id] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        setPendingStatus('')
      } else {
        setError(result.message || 'Could not update status')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update status'))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-center text-ink-300">Loading…</p>
      </DashboardShell>
    )
  }

  if (isError || !order) {
    return (
      <DashboardShell>
        <p className="text-center text-chili-500">Couldn't load this order.</p>
      </DashboardShell>
    )
  }

  const isLocked = LOCKED_STATUSES.includes(order.status)

  return (
    <DashboardShell>
      <button
        onClick={() => navigate('/orders')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to orders
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-semibold text-ink-900">
                Order #{order.id}
              </h1>
              <Badge tone={toneForStatus(order.status)}>{formatStatusLabel(order.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {new Date(order.order_date).toLocaleString('en-IN')}
            </p>
          </Card>

          <Card className="divide-y divide-cream-100 p-5">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  className="h-12 w-12 shrink-0 rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-ink-900">{item.name}</p>
                  <p className="text-sm text-ink-500">
                    {item.quantity} {item.unit} × ₹{Number(item.price).toFixed(0)}
                  </p>
                </div>
                <p className="font-semibold text-ink-900">₹{Number(item.line_total).toFixed(0)}</p>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <p className="font-display text-base font-semibold text-ink-900">Total</p>
              <p className="font-display text-base font-semibold text-chili-500">
                ₹{Number(order.total_amount).toFixed(0)}
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Customer</h2>
            <p className="mt-2 text-sm text-ink-900">{order.customer.name}</p>
            <p className="text-sm text-ink-500">{order.customer.email}</p>
            <p className="text-sm text-ink-500">{order.customer.phone}</p>
            {order.customer.address ? (
              <p className="mt-2 text-sm text-ink-500">{order.customer.address}</p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Update status</h2>

            {isLocked ? (
              <p className="mt-2 text-sm text-ink-300">
                This order is {formatStatusLabel(order.status).toLowerCase()} and can no longer be
                modified.
              </p>
            ) : (
              <>
                <select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  className="mt-3 w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-chili-400"
                >
                  <option value="">Select new status…</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatStatusLabel(s)}
                    </option>
                  ))}
                </select>

                {error ? (
                  <p className="mt-2 text-sm font-medium text-chili-500">{error}</p>
                ) : null}

                <Button
                  onClick={handleUpdateStatus}
                  loading={isUpdating}
                  disabled={!pendingStatus}
                  className="mt-3 w-full"
                >
                  Update status
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
