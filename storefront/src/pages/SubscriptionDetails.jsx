import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  Flame,
  IndianRupee,
  PackageCheck,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  XCircle,
  CalendarX,
  AlertTriangle,
  CreditCard,
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

export default function SubscriptionDetails() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [actionError, setActionError] = useState(null)
  const [actionSuccess, setActionSuccess] = useState(null)
  const [isActing, setIsActing] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const detailQuery = useQuery({
    queryKey: ['subscription', 'details', Number(id)],
    queryFn: () => getSubscriptionDetails(id),
    enabled: Boolean(id),
  })

  const subscription = detailQuery.data?.subscription
  const rawProducts = detailQuery.data?.products
  const deliverySchedule = detailQuery.data?.delivery_schedule ?? []

  const productsById = useMemo(() => {
    const map = new Map()
    if (!rawProducts) return map
    rawProducts.forEach((p) => map.set(p.id, p))
    return map
  }, [rawProducts])

  const refreshAll = () => {
    detailQuery.refetch()
    queryClient.invalidateQueries({ queryKey: ['subscription', 'mine'] })
  }

  const handlePause = async () => {
    setActionError(null)
    setActionSuccess(null)
    setIsActing(true)
    try {
      const res = await pauseSubscription({ subscriptionId: id })
      if (res.success) {
        setActionSuccess('Subscription paused successfully.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not pause subscription')
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not pause subscription'))
    } finally {
      setIsActing(false)
    }
  }

  const handleResume = async () => {
    setActionError(null)
    setActionSuccess(null)
    setIsActing(true)
    try {
      const res = await resumeSubscription({ subscriptionId: id })
      if (res.success) {
        setActionSuccess('Subscription resumed successfully.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not resume subscription')
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not resume subscription'))
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
        setActionSuccess('Subscription cancelled.')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not cancel subscription')
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not cancel subscription'))
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
    setActionSuccess(null)
    setIsActing(true)
    try {
      const res = await skipSubscriptionDay({
        subscriptionId: id,
        skipDate: date,
        reason: reason || undefined,
      })
      if (res.success) {
        setActionSuccess(`Delivery on ${date} skipped.`)
        setShowSkipModal(false)
        setModalDate('')
        setSkipReason('')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not skip delivery date')
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not skip delivery date'))
    } finally {
      setIsActing(false)
    }
  }

  const handleUnskipDay = async (date) => {
    setActionError(null)
    setActionSuccess(null)
    setIsActing(true)
    try {
      const res = await unskipSubscriptionDay({ subscriptionId: id, skipDate: date })
      if (res.success) {
        setActionSuccess(`Delivery on ${date} resumed.`)
        setShowSkipModal(false)
        setModalDate('')
        refreshAll()
      } else {
        setActionError(res.message || 'Could not unskip delivery date')
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'Could not unskip delivery date'))
    } finally {
      setIsActing(false)
    }
  }

  const handlePaySubscription = async () => {
    setActionError(null)
    setActionSuccess(null)
    setIsActing(true)
    try {
      if (!window.Razorpay) {
        setActionError('Razorpay SDK not loaded. Please refresh the page.')
        setIsActing(false)
        return
      }

      const res = await createRazorpayOrder({ subscriptionId: Number(id) })
      if (!res.success || !res.razorpay) {
        setActionError(res.message || 'Could not initiate Razorpay payment for subscription')
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
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              subscription_id: Number(id),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            if (verifyRes.success) {
              setActionSuccess('Subscription payment confirmed!')
              refreshAll()
            } else {
              setActionError(verifyRes.message || 'Payment verification failed.')
            }
          } catch (err) {
            setActionError(getApiErrorMessage(err, 'Payment verification failed.'))
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
      setActionError(getApiErrorMessage(err, 'Could not initiate payment'))
      setIsActing(false)
    }
  }

  return (
    <AppShell>
      <PageHeader title="Subscription details" />

      <div className="px-4 pb-8 md:mx-auto md:max-w-xl">
        {detailQuery.isLoading ? (
          <DetailsSkeleton />
        ) : detailQuery.isError ? (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-card border border-dashed border-chili-200 bg-chili-50/40 p-6 text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-chili-500 shadow-sm">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">Couldn't load this subscription</p>
              <p className="mt-0.5 text-sm text-ink-500">Check your connection and try again.</p>
            </div>
            <button
              type="button"
              onClick={() => detailQuery.refetch()}
              className="flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-chili-500 shadow-sm ring-1 ring-chili-200 transition-colors duration-200 hover:bg-chili-500 hover:text-cream-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : (
          <>
            <HeroCard subscription={subscription} />

            {/* Notification messages */}
            {actionError ? (
              <p className="mt-3 rounded-xl bg-chili-50 p-2.5 text-xs font-medium text-chili-600">
                {actionError}
              </p>
            ) : null}
            {actionSuccess ? (
              <p className="mt-3 rounded-xl bg-success-50 p-2.5 text-xs font-medium text-success-700">
                {actionSuccess}
              </p>
            ) : null}

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {subscription.payment_status !== 'PAID' && subscription.status !== 'CANCELLED' ? (
                <Button
                  variant="primary"
                  onClick={handlePaySubscription}
                  disabled={isActing}
                  className="flex items-center gap-1.5 text-xs py-2 shadow-sm"
                >
                  <CreditCard className="h-4 w-4" />
                  Pay ₹{subscription.total_amount} Now
                </Button>
              ) : null}
              {subscription.status === 'ACTIVE' || subscription.status === 'APPROVED' ? (
                <Button
                  variant="ghost"
                  onClick={handlePause}
                  disabled={isActing}
                  className="flex items-center gap-1.5 text-xs py-2 bg-white shadow-sm ring-1 ring-cream-300"
                >
                  <PauseCircle className="h-4 w-4 text-warning-600" />
                  Pause subscription
                </Button>
              ) : null}

              {subscription.status === 'PAUSED' ? (
                <Button
                  variant="ghost"
                  onClick={handleResume}
                  disabled={isActing}
                  className="flex items-center gap-1.5 text-xs py-2 bg-white shadow-sm ring-1 ring-cream-300"
                >
                  <PlayCircle className="h-4 w-4 text-success-600" />
                  Resume subscription
                </Button>
              ) : null}

              {subscription.status === 'ACTIVE' || subscription.status === 'APPROVED' ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSkipModalMode('skip')
                    setShowSkipModal(true)
                  }}
                  disabled={isActing}
                  className="flex items-center gap-1.5 text-xs py-2 bg-white shadow-sm ring-1 ring-cream-300"
                >
                  <CalendarX className="h-4 w-4 text-ink-600" />
                  Skip / Unskip date
                </Button>
              ) : null}

              {subscription.status !== 'CANCELLED' && subscription.status !== 'COMPLETED' ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  disabled={isActing}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-white px-3.5 py-2 text-xs font-semibold text-chili-500 shadow-sm ring-1 ring-cream-300 hover:bg-chili-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel plan
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
                <Card className="w-full max-w-sm p-5 shadow-2xl">
                  <div className="flex items-center gap-2 text-ink-900">
                    <CalendarX className="h-5 w-5 text-chili-500 shrink-0" />
                    <h3 className="font-display text-base font-semibold">
                      {skipModalMode === 'skip' ? 'Skip Delivery Date' : 'Unskip (Resume) Delivery Date'}
                    </h3>
                  </div>

                  <div className="mt-3 flex rounded-lg bg-cream-100 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSkipModalMode('skip')}
                      className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
                        skipModalMode === 'skip' ? 'bg-white text-chili-600 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      Skip Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setSkipModalMode('unskip')}
                      className={`flex-1 py-1 rounded-md font-semibold transition-colors ${
                        skipModalMode === 'unskip' ? 'bg-white text-success-700 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      Resume / Unskip
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-ink-700">Delivery Date</label>
                      <input
                        type="date"
                        value={modalDate}
                        onChange={(e) => setModalDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                      />
                    </div>

                    {skipModalMode === 'skip' ? (
                      <div>
                        <label className="text-xs font-medium text-ink-700">Reason (optional)</label>
                        <input
                          type="text"
                          value={skipReason}
                          onChange={(e) => setSkipReason(e.target.value)}
                          placeholder="e.g. Out of town, traveling"
                          className="mt-1 w-full rounded-xl border border-cream-300 p-2 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSkipModal(false)}
                      disabled={isActing}
                      className="text-xs py-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (!modalDate) return
                        if (skipModalMode === 'skip') {
                          handleSkipDay(modalDate, skipReason)
                        } else {
                          handleUnskipDay(modalDate)
                        }
                      }}
                      disabled={isActing || !modalDate}
                      className="text-xs py-2"
                    >
                      {isActing ? 'Processing...' : skipModalMode === 'skip' ? 'Skip Date' : 'Resume Date'}
                    </Button>
                  </div>
                </Card>
              </div>
            ) : null}

            {/* Cancel Modal */}
            {showCancelModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4">
                <Card className="w-full max-w-sm p-5 shadow-2xl">
                  <div className="flex items-center gap-2 text-chili-500">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <h3 className="font-display text-base font-semibold text-ink-900">Cancel Subscription</h3>
                  </div>
                  <p className="mt-2 text-xs text-ink-500">
                    Are you sure you want to cancel your "{subscription.name}" subscription? Future deliveries will be stopped.
                  </p>
                  <textarea
                    rows={2}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason for cancellation (optional)..."
                    className="mt-3 w-full rounded-xl border border-cream-300 p-2.5 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                  <div className="mt-4 flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setShowCancelModal(false)} disabled={isActing}>
                      Keep subscription
                    </Button>
                    <Button
                      onClick={handleCancel}
                      loading={isActing}
                      className="bg-chili-500 text-cream-50 hover:bg-chili-600"
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
    <Card className="mt-4 overflow-hidden bg-gradient-to-br from-chili-500 to-chili-600 p-5 text-cream-50 shadow-lg shadow-chili-900/15">
      <Badge tone="inverse">{formatStatusLabel(subscription.status)}</Badge>
      <h1 className="mt-3 font-display text-2xl font-semibold">{subscription.name}</h1>
      {subscription.description ? (
        <p className="mt-1 text-sm leading-relaxed opacity-85">{subscription.description}</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-cream-50/20 pt-4 sm:grid-cols-4">
        <Stat icon={IndianRupee} label="Per week" value={`₹${subscription.price_per_week}`} />
        <Stat icon={IndianRupee} label="Total" value={`₹${subscription.total_amount}`} />
        <Stat icon={CalendarDays} label="Weeks" value={subscription.weeks} />
        <Stat
          icon={CalendarClock}
          label="Duration"
          value={`${subscription.start_date} – ${subscription.end_date}`}
          wide
        />
      </div>

      {subscription.exclude_saturday || subscription.exclude_sunday ? (
        <p className="mt-3 text-xs opacity-80">
          No deliveries on{' '}
          {[subscription.exclude_saturday && 'Saturdays', subscription.exclude_sunday && 'Sundays']
            .filter(Boolean)
            .join(' or ')}
          .
        </p>
      ) : null}
    </Card>
  )
}

function Stat({ icon: Icon, label, value, wide }) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-4' : ''}>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide opacity-75">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-0.5 text-sm font-semibold leading-snug">{value}</p>
    </div>
  )
}

function ProductsSection({ products }) {
  if (products.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="font-display text-lg font-semibold text-ink-900">What's included</h2>
      <p className="mt-0.5 text-sm text-ink-500">
        {products.length} {products.length === 1 ? 'item' : 'items'} on rotation for this plan
      </p>

      <div className="mt-3 space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="flex gap-3 p-3">
            <ProductImage
              src={product.image_url}
              alt={product.name}
              className="h-16 w-16 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink-900">
                  {product.name}
                </h3>
                {Number(product.nutrition?.calories) > 0 ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-pill bg-ink-900/[0.05] px-2 py-0.5 text-[11px] font-medium text-ink-700">
                    <Flame className="h-3 w-3 text-chili-500" />
                    {Math.round(product.nutrition.calories)} kcal
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-ink-300">
                {product.quantity} {product.unit}
              </p>

              {Number(product.nutrition?.calories) > 0 ? (
                <div className="mt-2 grid grid-cols-4 gap-1 border-t border-ink-900/[0.06] pt-2">
                  <NutrientStat label="Pro" value={product.nutrition.protein} unit="g" />
                  <NutrientStat label="Carb" value={product.nutrition.carbs} unit="g" />
                  <NutrientStat label="Fat" value={product.nutrition.fat} unit="g" />
                  <NutrientStat label="Fib" value={product.nutrition.fiber} unit="g" />
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function NutrientStat({ label, value, unit = '' }) {
  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <span className="truncate text-xs font-semibold text-ink-900">
        {value}
        {unit}
      </span>
      <span className="text-[9px] font-medium uppercase tracking-wide text-ink-300">{label}</span>
    </div>
  )
}

function ScheduleSection({ deliverySchedule, productsById, onSkipDay, isActing }) {
  if (deliverySchedule.length === 0) return null

  const todayStr = new Date().toISOString().slice(0, 10)

  return (
    <div className="mt-6">
      <h2 className="font-display text-lg font-semibold text-ink-900">Delivery schedule</h2>
      <p className="mt-0.5 text-sm text-ink-500">
        {deliverySchedule.length} {deliverySchedule.length === 1 ? 'delivery' : 'deliveries'} across
        this plan
      </p>

      <Card className="mt-3 divide-y divide-ink-900/[0.06] p-0">
        {deliverySchedule.map((entry) => {
          const product = productsById.get(entry.product_id)
          const isUpcoming = entry.delivery_date >= todayStr

          return (
            <div key={`${entry.delivery_date}-${entry.sequence}`} className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili-50 text-chili-500">
                <PackageCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-ink-900">
                  {product?.name ?? 'Product'}
                </p>
                <p className="text-xs text-ink-300">{formatDeliveryDate(entry.delivery_date)}</p>
              </div>

              {isUpcoming && onSkipDay ? (
                <button
                  type="button"
                  onClick={() => onSkipDay(entry.delivery_date)}
                  disabled={isActing}
                  className="rounded-pill bg-cream-100 px-2.5 py-1 text-[11px] font-semibold text-ink-600 hover:bg-cream-200 hover:text-chili-500 transition-colors disabled:opacity-50 shrink-0"
                >
                  Skip
                </button>
              ) : null}

              <span className="shrink-0 text-xs font-medium text-ink-300">#{entry.sequence}</span>
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
    <div className="mt-4 animate-pulse space-y-4">
      <div className="h-40 rounded-card bg-ink-900/5" />
      <div className="space-y-3">
        <div className="h-16 rounded-card bg-ink-900/5" />
        <div className="h-16 rounded-card bg-ink-900/5" />
        <div className="h-16 rounded-card bg-ink-900/5" />
      </div>
    </div>
  )
}