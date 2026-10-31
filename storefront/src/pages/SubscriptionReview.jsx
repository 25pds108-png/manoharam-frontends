import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ChevronLeft, RefreshCw, ArrowRight, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { HorizontalStepper } from '../components/ui/Stepper'
import ProductImage from '../components/ProductImage'
import { subscribeToPlan, previewSubscription } from '../api/subscriptions'
import { getApiErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'

const REVIEW_STEPS = [
  { label: 'Select Plan' },
  { label: 'Set Schedule' },
  { label: 'Review & Confirm' },
]

export default function SubscriptionReview() {
  const { planId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const { plan, startDate, weeks, excludeSaturday, excludeSunday } = location.state ?? {}

  const [skippedDates, setSkippedDates] = useState(() => new Set())

  const previewQuery = useQuery({
    queryKey: ['subscription-preview', planId, startDate, weeks, excludeSaturday, excludeSunday],
    queryFn: () =>
      previewSubscription({
        planId: Number(planId),
        weeks,
        startDate,
        excludeSaturday,
        excludeSunday,
      }),
    enabled: Boolean(plan && startDate),
  })

  const schedule = previewQuery.data
  const deliveryDays = schedule?.delivery_schedule ?? []
  const perDayRefund = plan ? Number(plan.price_per_week) / 7 : 0
  const baseTotal = plan ? plan.price_per_week * weeks : 0
  const skipCount = skippedDates.size
  const adjustedTotal = Math.max(0, baseTotal - skipCount * perDayRefund)

  const toggleSkip = (date) => {
    setSkippedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
        showToast('Restored delivery date')
      } else {
        next.add(date)
        showToast('Skipped delivery date (price adjusted)')
      }
      return next
    })
  }

  const subscribeMutation = useMutation({
    mutationFn: () =>
      subscribeToPlan({
        planId: plan.id,
        weeks,
        startDate,
        excludeSaturday,
        excludeSunday,
        skipDates: Array.from(skippedDates),
      }),
    onSuccess: (result) => {
      const total = result?.subscription?.total_amount
      showToast(
        total !== undefined
          ? `Subscribed! ₹${total} — pending kitchen verification.`
          : 'Subscribed! Your request is pending kitchen verification.',
      )
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      const subId = result?.subscription?.id
      if (subId) {
        navigate(`/subscriptions/${subId}`)
      } else {
        navigate('/subscription')
      }
    },
    onError: (err) => {
      showToast(getApiErrorMessage(err, 'Could not subscribe'), { type: 'error' })
    },
  })

  if (!plan || !startDate) {
    return (
      <AppShell>
        <div className="py-24 px-4 text-center max-w-md mx-auto">
          <p className="font-serif text-xl font-bold text-ink-900">Schedule details not found</p>
          <p className="mt-2 text-xs text-ink-500">Let's re-select your preferred schedule.</p>
          <Link to={`/subscribe/${planId}`} className="mt-6 inline-block">
            <Button variant="primary" size="md">
              Back to Schedule
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  if (previewQuery.isLoading) {
    return (
      <AppShell>
        <div className="py-24 text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Generating daily schedule preview…</p>
        </div>
      </AppShell>
    )
  }

  if (previewQuery.isError || !schedule) {
    return (
      <AppShell>
        <div className="py-24 px-4 flex flex-col items-center gap-3 text-center max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chili-100 text-chili-600 shadow-xs">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="font-serif text-lg font-bold text-ink-900">
            {getApiErrorMessage(previewQuery.error, "Couldn't load your delivery schedule.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => previewQuery.refetch()}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </Button>
        </div>
      </AppShell>
    )
  }

  const activeDeliveriesCount = deliveryDays.length - skipCount

  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="px-4 pb-48 pt-4 sm:px-6 md:pb-36 space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-chili-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Schedule Setup</span>
        </button>

        {/* 3-Step Progress Indicator */}
        <div className="mx-auto max-w-lg py-2">
          <HorizontalStepper steps={REVIEW_STEPS} currentStep={2} />
        </div>

        <div className="border-b border-cream-300 pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-chili-600 block">
            Step 2 of 2: Review & Confirm
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 mt-1">{plan.name}</h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-500">
            Review each scheduled date below. Click <strong className="text-chili-600">Skip</strong> on dates you are away to reduce your total.
          </p>
        </div>

        {/* Day-by-Day Delivery Schedule Card */}
        <Card className="divide-y divide-cream-300 p-0 overflow-hidden shadow-xs rounded-3xl border-cream-300">
          <div className="bg-cream-100/90 p-4 sm:p-5 border-b border-cream-300 flex items-center justify-between">
            <div>
              <span className="font-serif text-sm font-bold text-ink-900 block">
                Delivery Schedule
              </span>
              <span className="text-xs text-ink-500">
                {activeDeliveriesCount} Active Deliveries {skipCount > 0 ? `· ${skipCount} Skipped` : ''}
              </span>
            </div>
            <span className="text-xs font-semibold text-chili-600 bg-cream-50 px-3 py-1 rounded-full border border-cream-300">
              {new Date(schedule.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              {' – '}
              {new Date(schedule.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          <div className="divide-y divide-cream-200">
            {deliveryDays.map((day) => {
              const isSkipped = skippedDates.has(day.delivery_date)
              const formattedDate = new Date(day.delivery_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })

              return (
                <div
                  key={day.delivery_date}
                  className={`flex items-center gap-4 px-4 sm:px-6 py-4 transition-colors ${
                    isSkipped ? 'bg-cream-100/40' : 'bg-cream-50 hover:bg-cream-100/40'
                  }`}
                >
                  <ProductImage
                    src={day.product?.image_url}
                    alt={day.product?.name || 'Delicacy'}
                    className={`h-13 w-13 shrink-0 rounded-xl object-cover border border-cream-300/80 transition-all ${
                      isSkipped ? 'opacity-30 grayscale' : 'opacity-100'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-serif font-bold truncate ${
                          isSkipped ? 'text-ink-400 line-through' : 'text-ink-900'
                        }`}
                      >
                        {formattedDate}
                      </p>
                      {isSkipped ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-chili-600 bg-chili-50 px-2 py-0.5 rounded border border-chili-200">
                          Skipped (-₹{perDayRefund.toFixed(0)})
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        isSkipped ? 'text-ink-300 line-through' : 'text-ink-600'
                      }`}
                    >
                      {day.product?.name ?? 'Homestyle meal rotation'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSkip(day.delivery_date)}
                    className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
                      isSkipped
                        ? 'border border-ink-300 bg-cream-50 text-ink-700 hover:bg-cream-200'
                        : 'border border-chili-200 bg-chili-50 text-chili-600 hover:bg-chili-600 hover:text-cream-50'
                    }`}
                  >
                    {isSkipped ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Restore</span>
                      </>
                    ) : (
                      <span>Skip</span>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Pricing Summary Card */}
        <Card className="p-6 sm:p-7 space-y-3.5 rounded-3xl border-cream-300 shadow-xs">
          <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900 border-b border-cream-300 pb-3">
            Subscription Pricing Breakdown
          </h2>

          <div className="flex items-center justify-between text-xs sm:text-sm text-ink-600">
            <span>
              {weeks} {weeks === 1 ? 'Week' : 'Weeks'} Plan Base Rate ({weeks * 7} total days)
            </span>
            <span className="font-semibold text-ink-900 tabular-nums">₹{baseTotal.toFixed(0)}</span>
          </div>

          {skipCount > 0 ? (
            <div className="flex items-center justify-between text-xs sm:text-sm text-chili-600">
              <span className="font-medium">
                {skipCount} Skipped {skipCount === 1 ? 'Day' : 'Days'} Refund Credit
              </span>
              <span className="font-bold tabular-nums">-₹{(skipCount * perDayRefund).toFixed(0)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs sm:text-sm text-success-600">
            <span>Doorstep Morning Delivery Fee</span>
            <span className="font-bold uppercase tracking-wider">FREE</span>
          </div>

          <div className="flex items-center justify-between border-t border-cream-300 pt-3.5 text-base font-bold text-ink-900">
            <div>
              <span className="block font-serif text-lg">Total Payable</span>
              <span className="block text-[11px] font-normal text-ink-500">Includes all applicable packaging & taxes</span>
            </div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-chili-600 tabular-nums">
              ₹{adjustedTotal.toFixed(0)}
            </span>
          </div>

          {skipCount > 0 ? (
            <p className="text-[11px] text-ink-400 italic pt-1">
              * The confirmed total with all skip adjustments is finalized upon order submission.
            </p>
          ) : null}
        </Card>

        {/* Safe Home Quality Seal */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-cream-300 bg-cream-50 p-4 text-xs text-ink-700 shadow-2xs">
          <ShieldCheck className="h-5 w-5 text-success-500 shrink-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-ink-900">Safe, as your mother&apos;s home:</strong> Every meal rotation is cooked with 100% cold-pressed oils, pure spices, and no artificial preservatives. Pause or modify your schedule anytime.
          </p>
        </div>
      </div>

      {/* Sticky Bottom Confirmation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-100/95 p-4 backdrop-blur-md shadow-2xl">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-500">
              Total for {activeDeliveriesCount} deliveries
            </p>
            <p className="font-serif text-xl font-bold text-chili-600 tabular-nums">
              ₹{adjustedTotal.toFixed(0)}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-initial sm:min-w-[300px] shadow-md py-3.5"
            loading={subscribeMutation.isPending}
            onClick={() => subscribeMutation.mutate()}
          >
            <span>Confirm Subscription · ₹{adjustedTotal.toFixed(0)}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}