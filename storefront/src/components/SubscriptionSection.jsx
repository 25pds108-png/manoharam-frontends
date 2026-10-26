import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowUpRight, CalendarX2, RefreshCw, Repeat, Utensils } from 'lucide-react'
import { formatStatusLabel } from './ui/Badge'
import { listMySubscriptions, listSubscribableSalads } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'
import CategoryPicker from './subscription/CategoryPicker'
import PlanCard from './subscription/PlanCard'

/**
 * Home-page subscription slot.
 *
 * Design changes from the previous pass:
 * - The heading no longer sits under a tracked-out ALL-CAPS eyebrow label
 *   ("DAILY MENU") — that pattern reads as generic template chrome rather
 *   than something specific to this product. The heading now asks the
 *   question a returning customer is actually here to answer.
 * - Added a two-item capability strip (skip anytime, multiple plans at
 *   once) directly under the heading. Both are real, already-shipped
 *   features (see skipSubscriptionDay in api/subscriptions.js and the
 *   "multiple concurrent subscriptions" note below) — this isn't
 *   decorative marketing copy, it's telling a first-time visitor what
 *   they're actually signing up for before they commit to a plan.
 *
 * Flow: pick a dietary tab -> tap a row to continue to /subscribe/:planId,
 * which owns date/duration selection and, after that, the daily-schedule
 * review and final "Subscribe" action. This component only owns the
 * "discover a plan" step.
 *
 * Multiple concurrent subscriptions are allowed, so this shows every
 * subscribable plan in the selected category — minus every plan the user
 * already has a live (PENDING/ACTIVE) subscription for — plus a compact
 * "current order" strip up top for the most recent one.
 *
 * list_my_subscriptions.php returns every live subscription the customer
 * has (not just the latest), so all of them are excluded from the picker
 * below — previously this only knew about one at a time.
 */
export default function SubscriptionSection() {
  const [category, setCategory] = useState('VEG')

  const subscriptionsQuery = useQuery({
    queryKey: ['subscription', 'mine'],
    queryFn: listMySubscriptions,
  })

  const liveSubscriptions = subscriptionsQuery.data?.subscriptions ?? []
  // list_my_subscriptions.php already filters to PENDING/ACTIVE and orders
  // most-recent-first, so the first entry is what the banner shows.
  const latestSubscription = liveSubscriptions[0] ?? null
  const hasLiveSubscription = Boolean(latestSubscription)

  // Fetched as soon as status is known, not gated on picking a tab — the
  // endpoint returns every plan in one call regardless of category, so
  // waiting for a tap only bought an extra loading flash on first switch.
  const saladsQuery = useQuery({
    queryKey: ['subscription', 'salads'],
    queryFn: listSubscribableSalads,
    enabled: !subscriptionsQuery.isLoading,
  })

  const allPlans = saladsQuery.data?.plans ?? []

  const subscribablePlans = useMemo(() => {
    const subscribedPlanIds = new Set(liveSubscriptions.map((s) => s.plan_id))
    return allPlans.filter((plan) => !subscribedPlanIds.has(plan.id))
  }, [allPlans, liveSubscriptions])

  const counts = useMemo(() => {
    return subscribablePlans.reduce(
      (acc, plan) => {
        const type = getPlanDietaryType(plan)
        acc[type] = (acc[type] ?? 0) + 1
        return acc
      },
      { VEG: 0, NON_VEG: 0 },
    )
  }, [subscribablePlans])

  const availablePlans = useMemo(
    () => subscribablePlans.filter((plan) => getPlanDietaryType(plan) === category),
    [subscribablePlans, category],
  )

  // Subscription status failed to load — fail quiet here rather than
  // breaking the Home page; /subscription still surfaces the real error.
  if (subscriptionsQuery.isError) return null

  return (
    <div>
      {subscriptionsQuery.isLoading ? (
        <OrderStripSkeleton />
      ) : hasLiveSubscription ? (
        <Link
          to="/subscription"
          className="group flex items-center gap-3 rounded-card border border-dashed border-chili-300/60 bg-chili-50/40 px-4 py-3 transition-colors duration-200 hover:bg-chili-50"
        >
          <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-chili-500" />
          <span className="min-w-0 flex-1 text-sm">
            <span className="font-semibold text-ink-900">{formatStatusLabel(latestSubscription.status)}</span>
            <span className="text-ink-500"> · {latestSubscription.plan_name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wide text-chili-500">
            Manage
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      ) : null}

      <div className={hasLiveSubscription || subscriptionsQuery.isLoading ? 'mt-7' : ''}>
        <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-[28px]">
          What's on today's menu?
        </h2>
        <p className="mt-1 text-sm text-ink-500">Fresh salads, delivered to your door every morning.</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-medium text-ink-500">
          <span className="flex items-center gap-1.5">
            <CalendarX2 className="h-3.5 w-3.5 text-chili-500" />
            Skip any day, no charge
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-chili-500" />
            Mix veg and non-veg plans
          </span>
        </div>

        <div className="mt-5">
          <CategoryPicker selected={category} onSelect={setCategory} counts={saladsQuery.isSuccess ? counts : undefined} />
        </div>

        <div className="mt-4">
          {saladsQuery.isLoading ? (
            <PlansSkeleton />
          ) : saladsQuery.isError ? (
            <div className="flex flex-col items-start gap-3 rounded-card border border-dashed border-chili-200 bg-chili-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-chili-500 shadow-sm">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Menu didn't load</p>
                  <p className="text-sm text-ink-500">Check your connection and try again.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => saladsQuery.refetch()}
                className="flex shrink-0 items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-chili-500 shadow-sm ring-1 ring-chili-200 transition-colors duration-200 hover:bg-chili-500 hover:text-cream-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : availablePlans.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 rounded-card bg-ink-900/[0.03] px-5 py-10 text-center">
              <Utensils className="h-5 w-5 text-ink-300" />
              <p className="text-sm font-medium text-ink-500">
                No {category === 'VEG' ? 'veg' : 'non-veg'} items on today's menu
              </p>
              <p className="text-xs text-ink-300">
                Switch to {category === 'VEG' ? 'Non-veg' : 'Veg'}, or check back later
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {availablePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function OrderStripSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-dashed border-ink-900/10 px-4 py-3">
      <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-ink-900/10" />
      <div className="h-3.5 flex-1 animate-pulse rounded-full bg-ink-900/5" />
      <div className="h-3 w-14 shrink-0 animate-pulse rounded-full bg-ink-900/5" />
    </div>
  )
}

/** Card-shaped skeleton matching PlanCard's image + text layout. */
function PlansSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-card bg-white shadow-md shadow-ink-900/5">
          <div className="aspect-[4/3] w-full animate-pulse bg-ink-900/5" />
          <div className="space-y-2 p-3.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-ink-900/5" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-ink-900/5" />
            <div className="mt-2 h-7 w-full animate-pulse rounded-pill bg-ink-900/5" />
          </div>
        </div>
      ))}
    </div>
  )
}