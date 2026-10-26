import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, AlertTriangle, MapPin, CreditCard, Printer, Truck } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
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
import { getApiErrorMessage } from '../api/client'

export default function OrderDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
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
        setIsPaying(false)
        return
      }

      const res = await createRazorpayOrder({ orderId: order.id })
      if (!res.success || !res.razorpay) {
        setPayError(res.message || 'Could not initiate Razorpay payment')
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
          color: '#C1272D',
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
              refetch()
              queryClient.invalidateQueries({ queryKey: ['orders'] })
            }
          } catch (err) {
            setPayError(getApiErrorMessage(err, 'Payment verification failed.'))
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
      setPayError(getApiErrorMessage(err, 'Could not initiate payment'))
      setIsPaying(false)
    }
  }

  const handleCancelOrder = async () => {
    setCancelError(null)
    setIsCancelling(true)
    try {
      const res = await cancelOrder({ orderId: id, reason: cancelReason })
      if (res.success) {
        setShowCancelModal(false)
        refetch()
        queryClient.invalidateQueries({ queryKey: ['orders'] })
      } else {
        setCancelError(res.message || 'Could not cancel order')
      }
    } catch (err) {
      setCancelError(getApiErrorMessage(err, 'Could not cancel order'))
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Order" fallbackPath="/orders" />
        <p className="px-4 py-12 text-center text-ink-300">Loading…</p>
      </AppShell>
    )
  }

  if (isError || !order) {
    return (
      <AppShell>
        <PageHeader title="Order" fallbackPath="/orders" />
        <div className="px-4 py-12 text-center">
          <p className="text-chili-500 font-medium">Couldn't load this order.</p>
          <Button
            variant="secondary"
            onClick={() => navigate('/orders')}
            className="mt-4 text-xs"
          >
            Back to Orders
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title={`Order #${order.id}`} fallbackPath="/orders" />

      <div className="px-4 md:mx-auto md:max-w-2xl pb-10">
        {justPlaced ? (
          <Card className="mb-4 flex items-start gap-3 bg-gradient-to-br from-chili-500 to-chili-600 p-5 text-cream-50">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="font-display text-base font-semibold">Order placed successfully!</p>
              <p className="mt-1 text-sm text-cream-50/90">
                Our kitchen will prepare and dispatch your fresh meal on schedule.
              </p>
            </div>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-base font-semibold text-ink-900">Order #{order.id}</p>
              <p className="text-xs text-ink-500 mt-0.5">
                {new Date(order.order_date).toLocaleString('en-IN')}
              </p>
            </div>
            <Badge tone={toneForStatus(order.status)}>{formatStatusLabel(order.status)}</Badge>
          </div>

          {(order.payment_method || order.delivery_address) ? (
            <div className="mt-3.5 border-t border-cream-200 pt-3 space-y-2 text-xs text-ink-700">
              {order.payment_method ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5 text-ink-400" />
                    <span>Payment: {order.payment_method} {order.payment_status ? `(${order.payment_status})` : ''}</span>
                  </div>
                  {needsOnlinePayment ? (
                    <Button
                      onClick={handleOnlinePayment}
                      loading={isPaying}
                      className="px-3 py-1 text-xs bg-chili-500 text-cream-50 hover:bg-chili-600"
                    >
                      Pay Now
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {payError ? (
                <p className="text-xs text-chili-500 font-medium">{payError}</p>
              ) : null}
              {order.delivery_address ? (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-ink-400 mt-0.5 shrink-0" />
                  <span>Address: {order.delivery_address}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Visual Order Tracking Timeline */}
        {trackData?.steps ? (
          <Card className="mt-3 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="h-4 w-4 text-chili-500" />
              <h2 className="font-display text-sm font-semibold text-ink-900">
                Order Tracking
              </h2>
            </div>

            <div className="space-y-3">
              {trackData.steps.map((step, idx) => (
                <div key={step.step || idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        step.completed
                          ? 'bg-success-500 text-white'
                          : step.current
                          ? 'bg-chili-500 text-white animate-pulse'
                          : 'bg-cream-200 text-ink-400'
                      }`}
                    >
                      {step.completed ? '✓' : idx + 1}
                    </span>
                    {idx < trackData.steps.length - 1 ? (
                      <span
                        className={`w-0.5 h-6 mt-1 ${
                          step.completed ? 'bg-success-400' : 'bg-cream-200'
                        }`}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 pb-1">
                    <p
                      className={`text-xs font-semibold ${
                        step.current
                          ? 'text-chili-600'
                          : step.completed
                          ? 'text-ink-900'
                          : 'text-ink-400'
                      }`}
                    >
                      {step.name || step.step}
                    </p>
                    {step.description ? (
                      <p className="text-[11px] text-ink-500 mt-0.5">{step.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="mt-3 divide-y divide-cream-200 p-4">
          <h2 className="pb-2 font-display text-sm font-semibold text-ink-900">
            Items ({items.length})
          </h2>
          {items.map((item) => (
            <div key={item.product_id} className="flex items-center gap-3 py-3">
              <ProductImage
                src={item.image_url}
                alt={item.name}
                className="h-14 w-14 shrink-0 rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-ink-900 truncate">{item.name}</p>
                <p className="text-sm text-ink-500">
                  {item.quantity} {item.unit} × ₹{Number(item.price).toFixed(0)}
                </p>
              </div>
              <p className="font-semibold text-ink-900 shrink-0">
                ₹{Number(item.item_total).toFixed(0)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between pt-3">
            <p className="font-display text-base font-semibold text-ink-900">Total</p>
            <p className="font-display text-base font-semibold text-chili-500">
              ₹{Number(order.total_amount).toFixed(0)}
            </p>
          </div>
        </Card>

        {/* Invoice & Actions Strip */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-1">
          <a
            href={getInvoiceHtmlUrl(order.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-2 text-xs font-semibold text-ink-700 shadow-sm ring-1 ring-cream-300 hover:bg-cream-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-chili-500" />
            Print / Download Tax Invoice
          </a>

          {canCancel ? (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-xs font-semibold text-chili-500 hover:text-chili-600 transition-colors ml-auto"
            >
              Cancel this order
            </button>
          ) : null}
        </div>

        {/* Cancellation modal */}
        {showCancelModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
            <Card className="w-full max-w-sm p-5 shadow-2xl">
              <div className="flex items-center gap-2 text-chili-500">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h3 className="font-display text-base font-semibold text-ink-900">Cancel Order</h3>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Are you sure you want to cancel order #{order.id}? Any reserved items will be released back into inventory.
              </p>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation (optional)..."
                className="mt-3 w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
              />
              {cancelError ? (
                <p className="mt-2 text-xs font-medium text-chili-500">{cancelError}</p>
              ) : null}
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowCancelModal(false)}
                  disabled={isCancelling}
                >
                  Keep order
                </Button>
                <Button
                  onClick={handleCancelOrder}
                  loading={isCancelling}
                  className="bg-chili-500 text-cream-50 hover:bg-chili-600"
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
