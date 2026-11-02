import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  User,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react'
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
  const [successNotice, setSuccessNotice] = useState('')
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
        setSuccessNotice(`Order status changed to ${formatStatusLabel(pendingStatus)}.`)
        setTimeout(() => setSuccessNotice(''), 4000)
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
        <div className="py-24 text-center">
          <p className="text-sm text-ink-400">Loading order details…</p>
        </div>
      </DashboardShell>
    )
  }

  if (isError || !order) {
    return (
      <DashboardShell>
        <div className="py-16 text-center">
          <p className="rounded-xl bg-chili-50 p-4 text-sm font-semibold text-chili-600 inline-block border border-chili-200">
            Couldn't load order #{id}.
          </p>
          <div className="mt-4">
            <Link to="/orders" className="text-xs font-semibold text-chili-500 hover:underline">
              ← Return to orders
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  const isLocked = LOCKED_STATUSES.includes(order.status)

  return (
    <DashboardShell>
      <div className="mb-4">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Orders
        </button>
      </div>

      {successNotice ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-forest-50 p-3.5 text-xs font-semibold text-forest-800 border border-forest-200">
          <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Details and Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-cream-100 pb-4">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                  Order #{order.id}
                </h1>
                <p className="text-xs text-ink-500 mt-0.5">
                  Placed on {new Date(order.order_date).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div>
                <Badge tone={toneForStatus(order.status)} className="text-xs">
                  {formatStatusLabel(order.status)}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-ink-400">Payment Status</span>
                <p className="font-semibold text-ink-900 mt-0.5">
                  {order.payment_status || 'PAID'}
                </p>
              </div>
              <div>
                <span className="text-ink-400">Payment Method</span>
                <p className="font-semibold text-ink-900 mt-0.5">
                  {order.payment_method || 'Online Razorpay'}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-ink-400">Total Items</span>
                <p className="font-semibold text-ink-900 mt-0.5">
                  {order.items?.length || 0} product(s)
                </p>
              </div>
            </div>
          </Card>

          {/* Ordered Line Items */}
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4 border-b border-cream-100 pb-3">
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-cream-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3.5 py-3.5">
                  <ProductImage
                    src={item.image_url}
                    alt={item.name}
                    className="h-14 w-14 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Pack: {item.quantity} {item.unit} · ₹{Number(item.price).toFixed(0)} each
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-ink-900 text-sm">
                      ₹{Number(item.line_total).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown Footer */}
            <div className="mt-4 border-t border-cream-200 pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-600">
                <span>Subtotal</span>
                <span className="font-medium text-ink-900">₹{Number(order.total_amount).toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-600">
                <span>Shipping & Handling</span>
                <span className="font-medium text-forest-600">FREE</span>
              </div>
              <div className="flex items-center justify-between border-t border-cream-100 pt-3 text-sm font-bold text-ink-900">
                <span className="font-display">Total Amount</span>
                <span className="font-display text-base text-chili-600">
                  ₹{Number(order.total_amount).toFixed(0)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Column: Customer & Status Controls */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <Card className="p-5">
            <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-3">
              <User className="h-4 w-4 text-chili-500" />
              <h2 className="font-display text-base font-semibold text-ink-900">Customer</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-ink-400">Name</span>
                <p className="font-semibold text-ink-900 text-sm mt-0.5">{order.customer.name}</p>
              </div>
              {order.customer.email && (
                <div>
                  <span className="text-ink-400">Email</span>
                  <p className="mt-0.5">
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="font-medium text-chili-500 hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </p>
                </div>
              )}
              {order.customer.phone && (
                <div>
                  <span className="text-ink-400">Phone</span>
                  <p className="mt-0.5">
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="font-medium text-chili-500 hover:underline"
                    >
                      {order.customer.phone}
                    </a>
                  </p>
                </div>
              )}
              {order.customer.address && (
                <div className="border-t border-cream-100 pt-3">
                  <div className="flex items-center gap-1.5 text-ink-400 mb-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="text-ink-700 leading-relaxed">{order.customer.address}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Fulfillment Status Management */}
          <Card className="p-5">
            <div className="flex items-center gap-2 border-b border-cream-100 pb-3 mb-3">
              <Truck className="h-4 w-4 text-forest-600" />
              <h2 className="font-display text-base font-semibold text-ink-900">
                Fulfillment Status
              </h2>
            </div>

            {isLocked ? (
              <div className="rounded-xl bg-cream-50 p-3.5 text-xs text-ink-600 border border-cream-200">
                This order is marked as{' '}
                <strong className="text-ink-900">{formatStatusLabel(order.status)}</strong> and is locked
                from further status changes.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <label className="block font-medium text-ink-700">
                  Update Order Progression:
                </label>
                <select
                  value={pendingStatus}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                >
                  <option value="">Select new status…</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {formatStatusLabel(s)}
                    </option>
                  ))}
                </select>

                {error ? (
                  <p className="text-xs font-semibold text-chili-600">{error}</p>
                ) : null}

                <Button
                  onClick={handleUpdateStatus}
                  loading={isUpdating}
                  disabled={!pendingStatus}
                  className="w-full shadow-sm text-xs"
                >
                  Confirm Status Update
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
