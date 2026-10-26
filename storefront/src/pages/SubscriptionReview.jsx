import { useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ChevronLeft, RefreshCw } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { subscribeToPlan, previewSubscription } from '../api/subscriptions'
import { getApiErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'

/**
 * Step 2 of the subscribe flow, at /subscribe/:planId/review: shows every
 * delivery day in the chosen schedule with its assigned food and a
 * per-day "Skip" toggle that lowers the running total, then creates the
 * subscription with those skips folded in.
 *
 * Requires `plan`, `startDate`, `weeks`, `excludeSaturday`, `excludeSunday`
 * in router state (set by SubscriptionSetup on "Review daily schedule").
 * If it's missing — e.g. a refresh on this URL — there's no server-side
 * draft to recover from, so we send the user back to re-pick a schedule.
 *
 * The day-by-day schedule (with each day's real assigned product) comes
 * from POST /subscription_preview.php, not built client-side — the plan
 * data handed down from the picker only has { id, name, category,
 * price_per_week }, no products, so there's nothing to build a real
 * schedule from locally.
 *
 * Pricing note: the "Payable" total shown here is an estimate — flat
 * `price_per_week * weeks` minus `skipCount * (price_per_week / 7)` — for
 * instant feedback as the user toggles skips. The authoritative total
 * (base_amount, discount_amount, total_amount) is computed server-side by
 * subscribe_plan.php via calculateSubscriptionPricing() once skip_dates is
 * submitted, and that's the number that actually gets charged.
 */
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
  const adjustedTotal = baseTotal - skipCount * perDayRefund

  const toggleSkip = (date) => {
    setSkippedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
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
          ? `Subscribed! ₹${total} — pending admin approval.`
          : 'Subscribed! Your request is pending admin approval.',
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
        <div className="p-6 text-center">
          <p className="text-ink-500">Your schedule details were lost — let's pick them again.</p>
          <Link
            to={`/subscribe/${planId}`}
            className="mt-3 inline-block text-sm font-semibold text-chili-500"
          >
            Back to schedule
          </Link>
        </div>
      </AppShell>
    )
  }

  if (previewQuery.isLoading) {
    return (
      <AppShell>
        <p className="p-6 text-center text-ink-300">Loading your schedule…</p>
      </AppShell>
    )
  }

  if (previewQuery.isError || !schedule) {
    return (
      <AppShell>
        <div className="flex flex-col items-center gap-3 p-6 text-center">
          <AlertCircle className="h-5 w-5 text-chili-500" />
          <p className="text-sm text-ink-500">
            {getApiErrorMessage(previewQuery.error, "Couldn't load your schedule.")}
          </p>
          <button
            type="button"
            onClick={() => previewQuery.refetch()}
            className="flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-chili-500 shadow-sm ring-1 ring-chili-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 pb-44 pt-4 sm:px-6 md:pb-32">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium text-ink-500"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="font-display mt-3 text-2xl font-semibold text-ink-900">{plan.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {deliveryDays.length} deliveries ·{' '}
          {new Date(schedule.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          {' – '}
          {new Date(schedule.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </p>

        <Card className="mt-5 divide-y divide-cream-100 p-0">
          {deliveryDays.map((day) => {
            const isSkipped = skippedDates.has(day.delivery_date)
            return (
              <div key={day.delivery_date} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isSkipped ? 'text-ink-300 line-through' : 'text-ink-900'
                    }`}
                  >
                    {new Date(day.delivery_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <p
                    className={`text-xs ${
                      isSkipped ? 'text-ink-200 line-through' : 'text-ink-500'
                    }`}
                  >
                    {day.product?.name ?? 'Item to be assigned'}
                  </p>
                </div>
                <button
                  onClick={() => toggleSkip(day.delivery_date)}
                  className={`rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSkipped ? 'bg-cream-100 text-ink-500' : 'bg-chili-50 text-chili-500'
                  }`}
                >
                  {isSkipped ? 'Undo skip' : 'Skip'}
                </button>
              </div>
            )
          })}
        </Card>

        <Card className="mt-4 p-4">
          <div className="flex items-center justify-between text-sm text-ink-500">
            <span>
              {weeks} {weeks === 1 ? 'week' : 'weeks'} × ₹{plan.price_per_week}
            </span>
            <span>₹{baseTotal.toFixed(2)}</span>
          </div>
          {skipCount > 0 ? (
            <div className="mt-1 flex items-center justify-between text-sm text-chili-500">
              <span>
                {skipCount} skipped {skipCount === 1 ? 'day' : 'days'}
              </span>
              <span>-₹{(skipCount * perDayRefund).toFixed(2)}</span>
            </div>
          ) : null}
          <div className="mt-2 flex items-center justify-between border-t border-cream-100 pt-2 text-base font-semibold text-ink-900">
            <span>Payable</span>
            <span>₹{adjustedTotal.toFixed(2)}</span>
          </div>
          {skipCount > 0 ? (
            <p className="mt-1 text-xs text-ink-300">
              Estimated — the confirmed total (with skip discount) is set once you subscribe.
            </p>
          ) : null}
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-30 border-t border-cream-200 bg-cream-50/95 p-4 backdrop-blur md:bottom-0 md:z-50">
        <div className="mx-auto max-w-2xl">
          <Button
            className="w-full"
            loading={subscribeMutation.isPending}
            onClick={() => subscribeMutation.mutate()}
          >
            Subscribe · ₹{adjustedTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}