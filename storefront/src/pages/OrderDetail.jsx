import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle, MapPin, CreditCard, Printer, Truck, ArrowLeft } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { VerticalTimeline } from '../components/ui/Stepper'
import ProductImage from '../components/ProductImage'
import {
  getOrderDetails,
  cancelOrder,
  createRazorpayOrder,
  trackOrder,
  getInvoiceHtmlUrl,
} from '../api/orders'
import { verifyPayment } from '../api/cart'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../api/client'

export default function OrderDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const justPlaced = Boolean(location.state?.justPlaced)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderDetails(id),
  })

  const { data: trackData } = useQuery({
    queryKey: ['order-track', id],
    queryFn: () => trackOrder(id),
    enabled: Boolean(id),
  })

  const order = data?.order
  const items = data?.items ?? []

  const canCancel = order && (order.status === 'PENDING' || order.status === 'CONFIRMED')
  const needsOnlinePayment =
    order &&
    order.payment_method === 'ONLINE' &&
    order.status === 'PENDING' &&
    order.payment_status !== 'PAID'

  const handleOnlinePayment = async () => {
    setPayError(null)
    setIsPaying(true)
    try {
      if (!window.Razorpay) {
        setPayError('Razorpay SDK not loaded. Please refresh the page.')
        showToast('Razorpay SDK not loaded', { type: 'error' })
        setIsPaying(false)
        return
      }

      const res = await createRazorpayOrder({ orderId: order.id })
      if (!res.success || !res.razorpay) {
        setPayError(res.message || 'Could not initiate Razorpay payment')
        showToast(res.message || 'Could not initiate Razorpay payment', { type: 'error' })
        setIsPaying(false)
        return
      }

      const options = {
        key: res.razorpay.key,
        amount: res.razorpay.amount,
        currency: res.razorpay.currency || 'INR',
        name: 'Manoharam Real Foods',
        description: `Order #${order.id}`,
        order_id: res.razorpay.razorpay_order_id,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: {
          color: '#9B2C2C', // chili-600
        },
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              order_id: order.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyRes.success) {
              showToast('Payment successful!')
              refetch()
              queryClient.invalidateQueries({ queryKey: ['orders'] })
            }
          } catch (err) {
            const msg = getApiErrorMessage(err, 'Payment verification failed.')
            setPayError(msg)
            showToast(msg, { type: 'error' })
          } finally {
            setIsPaying(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not initiate payment')
      setPayError(msg)
      showToast(msg, { type: 'error' })
      setIsPaying(false)
    }
  }

  const handleCancelOrder = async () => {
    setCancelError(null)
    setIsCancelling(true)
    try {
      const res = await cancelOrder({ orderId: id, reason: cancelReason })
      if (res.success) {
        showToast('Order cancelled successfully')
        setShowCancelModal(false)
        refetch()
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      } else {
        setCancelError(res.message || 'Could not cancel order')
        showToast(res.message || 'Could not cancel order', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not cancel order')
      setCancelError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Order" fallbackPath="/orders" />
        <div className="py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Loading order details…</p>
        </div>
      </AppShell>
    )
  }

  if (isError || !order) {
    return (
      <AppShell>
        <PageHeader title="Order" fallbackPath="/orders" />
        <div className="px-4 py-20 text-center max-w-md mx-auto">
          <p className="font-serif text-xl font-bold text-chili-600">Couldn't load this order</p>
          <p className="mt-1 text-xs text-ink-500">The order could not be retrieved from our kitchen records.</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/orders')}
            className="mt-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Orders</span>
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title={`Order #${order.id}`} fallbackPath="/orders" />

      <div className="px-4 md:mx-auto md:max-w-2xl pb-12 space-y-4">
        {justPlaced ? (
          <div className="flex items-start gap-3.5 rounded-3xl bg-chili-600 p-6 text-cream-50 shadow-md">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-cream-50" />
            <div>
              <p className="font-serif text-lg font-bold leading-tight">Order placed successfully!</p>
              <p className="mt-1 text-xs text-cream-100 leading-relaxed font-sans">
                Our kitchen will handcraft and dispatch your fresh meal on schedule.
              </p>
            </div>
          </div>
        ) : null}

        {/* Order Header Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg font-bold text-ink-900">Order #{order.id}</p>
              <p className="text-xs text-ink-500 mt-0.5">
                {new Date(order.order_date).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <Badge tone={toneForStatus(order.status)}>{formatStatusLabel(order.status)}</Badge>
          </div>

          {(order.payment_method || order.delivery_address) ? (
            <div className="border-t border-cream-300 pt-3 space-y-2 text-xs text-ink-700">
              {order.payment_method ? (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-ink-400" />
                    <span>Payment: {order.payment_method} {order.payment_status ? `(${order.payment_status})` : ''}</span>
                  </div>
                  {needsOnlinePayment ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOnlinePayment}
                      loading={isPaying}
                    >
                      Pay Now
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {payError ? (
                <p className="text-xs text-chili-600 font-semibold">{payError}</p>
              ) : null}
              {order.delivery_address ? (
                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="h-4 w-4 text-chili-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">Address: {order.delivery_address}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Visual Order Tracking Stepper Timeline */}
        {trackData?.steps ? (
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-300 pb-3">
              <Truck className="h-4.5 w-4.5 text-chili-600" />
              <h2 className="font-serif text-base font-bold text-ink-900">
                Kitchen & Delivery Timeline
              </h2>
            </div>

            <VerticalTimeline steps={trackData.steps} />
          </Card>
        ) : null}

        {/* Order Items List */}
        <Card className="p-6 divide-y divide-cream-300 space-y-4">
          <h2 className="font-serif text-base font-bold text-ink-900 pb-1">
            Ordered Delicacies ({items.length})
          </h2>
          <div className="divide-y divide-cream-300/60 pt-1">
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-3.5 py-3.5">
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover border border-cream-300/60"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm font-bold text-ink-900 truncate">{item.name}</p>
                  <p className="text-xs text-ink-500 mt-0.5 tabular-nums">
                    {item.quantity} {item.unit} × ₹{Number(item.price).toFixed(0)}
                  </p>
                </div>
                <p className="font-serif text-base font-bold text-chili-600 shrink-0 tabular-nums">
                  ₹{Number(item.item_total).toFixed(0)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="font-serif text-base font-bold text-ink-900">Total Amount</p>
            <p className="font-serif text-2xl font-bold text-chili-600 tabular-nums">
              ₹{Number(order.total_amount).toFixed(0)}
            </p>
          </div>
        </Card>

        {/* Invoice Download & Cancel Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href={getInvoiceHtmlUrl(order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-cream-50 px-4 py-2.5 text-xs font-semibold text-ink-700 shadow-xs border border-cream-300 hover:bg-cream-100 transition-colors"
          >
            <Printer className="h-4 w-4 text-chili-600" />
            <span>Print Tax Invoice</span>
          </a>

          {canCancel ? (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-semibold text-chili-600 hover:text-chili-700 underline transition-colors ml-auto"
            >
              Cancel this order
            </button>
          ) : null}
        </div>

        {/* Cancellation modal */}
        {showCancelModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-chili-600">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="font-serif text-lg font-bold text-ink-900">Cancel Order</h3>
              </div>
              <p className="text-xs text-ink-500 leading-relaxed">
                Are you sure you want to cancel order #{order.id}? Any reserved items will be returned to inventory.
              </p>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)..."
                className="w-full rounded-xl border border-cream-300 bg-cream-100 p-3 text-xs text-ink-900 focus:border-chili-500 focus:ring-1 focus:ring-chili-500 outline-none"
              />
              {cancelError ? (
                <p className="text-xs font-semibold text-chili-600">{cancelError}</p>
              ) : null}
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  Keep order
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCancelOrder}
                  loading={isCancelling}
                >
                  Yes, cancel order
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
