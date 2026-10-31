import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Flame,
  IndianRupee,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  XCircle,
  CalendarX,
  AlertTriangle,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
import ProductImage from '../components/ProductImage'
import {
  getSubscriptionDetails,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  skipSubscriptionDay,
  unskipSubscriptionDay,
} from '../api/subscriptions'
import { createRazorpayOrder, verifyPayment } from '../api/cart'
import { getApiErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'

export default function SubscriptionDetails() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [actionError, setActionError] = useState(null)
  const [isActing, setIsActing] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const detailQuery = useQuery({
    queryKey: ['subscription', 'details', Number(id)],
    queryFn: () => getSubscriptionDetails(id),
    enabled: Boolean(id),
  })

  const subscription = detailQuery.data?.subscription
  const products = useMemo(() => {
    if (Array.isArray(detailQuery.data?.products)) return detailQuery.data.products
    if (Array.isArray(subscription?.products)) return subscription.products
    return []
  }, [detailQuery.data?.products, subscription?.products])
  const deliverySchedule = detailQuery.data?.delivery_schedule ?? []

  const productsById = useMemo(() => {
    const map = new Map()
    products.forEach((p) => {
      if (p && p.id != null) {
        map.set(Number(p.id), p)
        map.set(String(p.id), p)
      }
    })
    return map
  }, [products])

  const refreshAll = () => {
    detailQuery.refetch()
    queryClient.invalidateQueries({ queryKey: ['subscription', 'mine'] })
  }

  const handlePause = async () => {
    setActionError(null)
    setIsActing(true)
    try {
      const res = await pauseSubscription({ subscriptionId: id })
      if (res.success) {
        showToast('Subscription paused successfully.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not pause subscription')
        showToast(res.message || 'Could not pause subscription', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not pause subscription')
      setActionError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsActing(false)
    }
  }

  const handleResume = async () => {
    setActionError(null)
    setIsActing(true)
    try {
      const res = await resumeSubscription({ subscriptionId: id })
      if (res.success) {
        showToast('Subscription resumed successfully.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not resume subscription')
        showToast(res.message || 'Could not resume subscription', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not resume subscription')
      setActionError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsActing(false)
    }
  }

  const handleCancel = async () => {
    setActionError(null)
    setIsActing(true)
    try {
      const res = await cancelSubscription({ subscriptionId: id, reason: cancelReason })
      if (res.success) {
        setShowCancelModal(false)
        showToast('Subscription cancelled.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not cancel subscription')
        showToast(res.message || 'Could not cancel subscription', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not cancel subscription')
      setActionError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsActing(false)
    }
  }

  const [showSkipModal, setShowSkipModal] = useState(false)
  const [skipModalMode, setSkipModalMode] = useState('skip') // 'skip' | 'unskip'
  const [modalDate, setModalDate] = useState('')
  const [skipReason, setSkipReason] = useState('')

  const handleSkipDay = async (date, reason = '') => {
    setActionError(null)
    setIsActing(true)
    try {
      const res = await skipSubscriptionDay({
        subscriptionId: id,
        skipDate: date,
        reason: reason || undefined,
      })
      if (res.success) {
        showToast(`Delivery on ${date} skipped.`)
        setShowSkipModal(false)
        setModalDate('')
        setSkipReason('')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not skip delivery date')
        showToast(res.message || 'Could not skip delivery date', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not skip delivery date')
      setActionError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsActing(false)
    }
  }

  const handleUnskipDay = async (date) => {
    setActionError(null)
    setIsActing(true)
    try {
      const res = await unskipSubscriptionDay({ subscriptionId: id, skipDate: date })
      if (res.success) {
        showToast(`Delivery on ${date} resumed.`)
        setShowSkipModal(false)
        setModalDate('')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not unskip delivery date')
        showToast(res.message || 'Could not unskip delivery date', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not unskip delivery date')
      setActionError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsActing(false)
    }
  }

  const handlePaySubscription = async () => {
    setActionError(null)
    setIsActing(true)
    try {
      if (!window.Razorpay) {
        setActionError('Razorpay SDK not loaded. Please refresh the page.')
        showToast('Razorpay SDK not loaded', { type: 'error' })
        setIsActing(false)
        return
      }

      const res = await createRazorpayOrder({ subscriptionId: Number(id) })
      if (!res.success || !res.razorpay) {
        const msg = res.message || 'Could not initiate Razorpay payment for subscription'
        setActionError(msg)
        showToast(msg, { type: 'error' })
        setIsActing(false)
        return
      }

      const options = {
        key: res.razorpay.key,
        amount: res.razorpay.amount,
        currency: res.razorpay.currency || 'INR',
        name: 'Manoharam Real Foods',
        description: `Subscription #${id}`,
        order_id: res.razorpay.razorpay_order_id,
        theme: {
          color: '#9B2C2C', // chili-600
        },
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              subscription_id: Number(id),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyRes.success) {
              showToast('Subscription payment confirmed!')
              refreshAll()
            } else {
              setActionError(verifyRes.message || 'Payment verification failed.')
              showToast(verifyRes.message || 'Payment verification failed.', { type: 'error' })
            }
          } catch (err) {
            const msg = getApiErrorMessage(err, 'Payment verification failed.')
            setActionError(msg)
            showToast(msg, { type: 'error' })
          } finally {
            setIsActing(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsActing(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not initiate payment')
      setActionError(msg)
      showToast(msg, { type: 'error' })
      setIsActing(false)
    }
  }

  return (
    <AppShell maxWidth="max-w-4xl">
      <PageHeader title="Subscription Details" fallbackPath="/subscription" />

      <div className="px-4 pb-16 pt-4 sm:px-6 space-y-6 animate-fade-in">
        {detailQuery.isLoading ? (
          <DetailsSkeleton />
        ) : detailQuery.isError ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-chili-200 bg-chili-50 p-8 text-center max-w-md mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 text-chili-600 shadow-xs">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold text-ink-900">Couldn't load this subscription</p>
              <p className="mt-1 text-xs text-ink-500">Check your connection and try again.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => detailQuery.refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : (
          <>
            <HeroCard subscription={subscription} />

            {/* Error banner */}
            {actionError ? (
              <p className="rounded-2xl border border-chili-200 bg-chili-50 p-3.5 text-xs font-semibold text-chili-600">
                {actionError}
              </p>
            ) : null}

            {/* Quick Actions Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {subscription.payment_status !== 'PAID' && subscription.status !== 'CANCELLED' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePaySubscription}
                  disabled={isActing}
                  className="shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pay ₹{subscription.total_amount} Now</span>
                </Button>
              ) : null}

              {subscription.status === 'ACTIVE' || subscription.status === 'APPROVED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePause}
                  disabled={isActing}
                  className="bg-cream-50 shadow-2xs"
                >
                  <PauseCircle className="h-4 w-4 text-amber-600" />
                  <span>Pause Subscription</span>
                </Button>
              ) : null}

              {subscription.status === 'PAUSED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResume}
                  disabled={isActing}
                  className="bg-cream-50 shadow-2xs"
                >
                  <PlayCircle className="h-4 w-4 text-success-500" />
                  <span>Resume Subscription</span>
                </Button>
              ) : null}

              {subscription.status === 'ACTIVE' || subscription.status === 'APPROVED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSkipModalMode('skip')
                    setShowSkipModal(true)
                  }}
                  disabled={isActing}
                  className="bg-cream-50 shadow-2xs"
                >
                  <CalendarX className="h-4 w-4 text-chili-600" />
                  <span>Skip / Resume Date</span>
                </Button>
              ) : null}

              {subscription.status !== 'CANCELLED' && subscription.status !== 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isActing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-xs font-semibold text-chili-600 shadow-xs hover:bg-chili-50 transition-colors ml-auto"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel Plan</span>
                </button>
              ) : null}
            </div>

            <ProductsSection products={products} />
            <ScheduleSection
              deliverySchedule={deliverySchedule}
              productsById={productsById}
              onSkipDay={handleSkipDay}
              isActing={isActing}
            />

            {/* Skip / Unskip Date Modal */}
            {showSkipModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm p-4 animate-fade-in">
                <Card className="w-full max-w-sm p-6 shadow-2xl space-y-4 rounded-3xl border-cream-300">
                  <div className="flex items-center gap-2.5 text-ink-900">
                    <CalendarX className="h-5 w-5 text-chili-600 shrink-0" />
                    <h3 className="font-serif text-lg font-bold">
                      {skipModalMode === 'skip' ? 'Skip Delivery Date' : 'Resume Delivery Date'}
                    </h3>
                  </div>

                  <div className="flex rounded-xl bg-cream-100 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSkipModalMode('skip')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                        skipModalMode === 'skip' ? 'bg-cream-50 text-chili-600 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      Skip Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkipModalMode('unskip')}
                      className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
                        skipModalMode === 'unskip' ? 'bg-cream-50 text-success-500 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      Resume / Unskip
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-ink-700">Delivery Date</label>
                      <input
                        type="date"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 focus:border-chili-500 outline-none"
                      />
                    </div>

                    {skipModalMode === 'skip' ? (
                      <div>
                        <label className="text-xs font-semibold text-ink-700">Reason (optional)</label>
                        <input
                          type="text"
                          value={skipReason}
                          onChange={(e) => setSkipReason(e.target.value)}
                          placeholder="e.g. Traveling, out of station"
                          className="mt-1 w-full rounded-xl border border-cream-300 bg-cream-100 p-2.5 text-xs text-ink-900 focus:border-chili-500 outline-none"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSkipModal(false)}
                      disabled={isActing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!modalDate) return
                        if (skipModalMode === 'skip') {
                          handleSkipDay(modalDate, skipReason)
                        } else {
                          handleUnskipDay(modalDate)
                        }
                      }}
                      disabled={isActing || !modalDate}
                    >
                      {isActing ? 'Processing...' : skipModalMode === 'skip' ? 'Skip Date' : 'Resume Date'}
                    </Button>
                  </div>
                </Card>
              </div>
            ) : null}

            {/* Cancel Modal */}
            {showCancelModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm p-4 animate-fade-in">
                <Card className="w-full max-w-sm p-6 shadow-2xl space-y-4 rounded-3xl border-cream-300">
                  <div className="flex items-center gap-2.5 text-chili-600">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <h3 className="font-serif text-lg font-bold text-ink-900">Cancel Subscription</h3>
                  </div>
                  <p className="text-xs text-ink-500 leading-relaxed">
                    Are you sure you want to cancel your "{subscription.name}" subscription? Future scheduled kitchen deliveries will be halted.
                  </p>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)..."
                    className="w-full rounded-xl border border-cream-300 bg-cream-100 p-3 text-xs text-ink-900 focus:border-chili-500 outline-none"
                  />
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)} disabled={isActing}>
                      Keep subscription
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCancel}
                      loading={isActing}
                    >
                      Yes, cancel
                    </Button>
                  </div>
                </Card>
              </div>
            ) : null}
          </>
        )}
      </div>
    </AppShell>
  )
}

function HeroCard({ subscription }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-chili-700 via-chili-800 to-chili-900 p-6 sm:p-8 text-cream-50 shadow-xl space-y-5 rounded-3xl border-none">
      <div className="flex items-center justify-between">
        <Badge tone="inverse" className="shadow-xs font-bold">{formatStatusLabel(subscription.status)}</Badge>
        <span className="text-xs font-bold text-amber-300 bg-ink-950/40 px-3 py-1 rounded-full border border-amber-300/20">
          Subscription #{subscription.id}
        </span>
      </div>

      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-cream-50">{subscription.name}</h1>
        {subscription.description ? (
          <p className="mt-1 text-xs sm:text-sm text-cream-100/90 leading-relaxed font-sans">{subscription.description}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-cream-50/20 pt-5 sm:grid-cols-4">
        <Stat icon={IndianRupee} label="Per week" value={`₹${Number(subscription.price_per_week || 0).toFixed(0)}`} />
        <Stat icon={IndianRupee} label="Total Paid" value={`₹${Number(subscription.total_amount || 0).toFixed(0)}`} />
        <Stat icon={CalendarDays} label="Duration" value={`${subscription.weeks} Weeks`} />
        <Stat
          icon={CalendarClock}
          label="Cycle Window"
          value={`${subscription.start_date} – ${subscription.end_date}`}
          wide
        />
      </div>

      {subscription.exclude_saturday || subscription.exclude_sunday ? (
        <p className="text-xs text-amber-200/90 pt-1 font-medium">
          Weekend deliveries excluded on{' '}
          {[subscription.exclude_saturday && 'Saturdays', subscription.exclude_sunday && 'Sundays']
            .filter(Boolean)
            .join(' and ')}
          .
        </p>
      ) : null}
    </Card>
  )
}

function Stat({ icon: Icon, label, value, wide }) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-4' : ''}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-amber-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 font-serif text-base sm:text-lg font-bold leading-snug tabular-nums text-cream-50">{value}</p>
    </div>
  )
}

function ProductsSection({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
          Kitchen Rotation
        </span>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900">Delicacies in Rotation</h2>
      </div>

      <div className="space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="flex gap-4 p-4 items-center rounded-2xl border-cream-300 shadow-2xs">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-xl object-cover border border-cream-300/80"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 font-serif text-sm sm:text-base font-bold text-ink-900">
                  {product.name}
                </h3>
                {Number(product.nutrition?.calories) > 0 ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    <Flame className="h-3 w-3 text-amber-500" />
                    {Math.round(product.nutrition.calories)} cal
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-ink-500">
                {product.quantity} {product.unit}
              </p>

              {Number(product.nutrition?.calories) > 0 ? (
                <div className="mt-2.5 grid grid-cols-4 gap-2 border-t border-cream-300/60 pt-2 text-center text-xs">
                  <div>
                    <span className="font-bold text-ink-900">{product.nutrition.protein}g</span>
                    <span className="block text-[9px] uppercase text-ink-400">Pro</span>
                  </div>
                  <div>
                    <span className="font-bold text-ink-900">{product.nutrition.carbs}g</span>
                    <span className="block text-[9px] uppercase text-ink-400">Carb</span>
                  </div>
                  <div>
                    <span className="font-bold text-ink-900">{product.nutrition.fat}g</span>
                    <span className="block text-[9px] uppercase text-ink-400">Fat</span>
                  </div>
                  <div>
                    <span className="font-bold text-ink-900">{product.nutrition.fiber}g</span>
                    <span className="block text-[9px] uppercase text-ink-400">Fib</span>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ScheduleSection({ deliverySchedule = [], productsById = new Map(), onSkipDay, isActing }) {
  if (!Array.isArray(deliverySchedule) || deliverySchedule.length === 0) return null

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
          Day-by-Day Calendar
        </span>
        <h2 className="font-serif text-lg sm:text-xl font-bold text-ink-900">Full Delivery Schedule ({deliverySchedule.length})</h2>
      </div>

      <Card className="divide-y divide-cream-300 p-0 overflow-hidden shadow-xs rounded-3xl border-cream-300">
        {deliverySchedule.map((entry) => {
          const product = productsById.get(Number(entry.product_id)) || productsById.get(String(entry.product_id))
          const isUpcoming = entry.delivery_date >= todayStr

          return (
            <div key={`${entry.delivery_date}-${entry.sequence}`} className="flex items-center gap-3.5 p-4 hover:bg-cream-100/40 transition-colors">
              <ProductImage
                src={product?.image_url}
                alt={product?.name || 'Scheduled Delicacy'}
                className="h-13 w-13 shrink-0 rounded-xl object-cover border border-cream-300/80"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-serif text-sm font-bold text-ink-900">
                  {product?.name ?? 'Scheduled Delicacy'}
                </p>
                <p className="text-xs text-ink-500 mt-0.5">{formatDeliveryDate(entry.delivery_date)}</p>
              </div>

              {isUpcoming && onSkipDay ? (
                <button
                  type="button"
                  onClick={() => onSkipDay(entry.delivery_date)}
                  disabled={isActing}
                  className="rounded-full bg-cream-100 border border-cream-300 px-3.5 py-1 text-xs font-bold text-ink-700 hover:border-chili-300 hover:text-chili-600 transition-colors disabled:opacity-50 shrink-0"
                >
                  Skip
                </button>
              ) : null}

              <span className="shrink-0 text-xs font-bold text-ink-400 bg-cream-100 px-2.5 py-1 rounded-md border border-cream-300/60">
                #{entry.sequence}
              </span>
            </div>
          )
        })}
      </Card>
    </div>
  )
}

function formatDeliveryDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function DetailsSkeleton() {
  return (
    <div className="mt-4 animate-pulse space-y-6">
      <div className="h-52 rounded-3xl bg-cream-200" />
      <div className="space-y-3">
        <div className="h-20 rounded-2xl bg-cream-200" />
        <div className="h-20 rounded-2xl bg-cream-200" />
        <div className="h-20 rounded-2xl bg-cream-200" />
      </div>
    </div>
  )
}