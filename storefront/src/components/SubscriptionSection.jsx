import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowUpRight, CalendarX2, RefreshCw, Repeat, Utensils } from 'lucide-react'
import { formatStatusLabel } from './ui/Badge'
import { listMySubscriptions, listSubscribableSalads } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'
import { useAuth } from '../context/AuthContext'
import CategoryPicker from './subscription/CategoryPicker'
import PlanCard from './subscription/PlanCard'
import { PlanCardSkeleton } from './ui/Skeleton'
import Button from './ui/Button'

export default function SubscriptionSection() {
  const [category, setCategory] = useState('VEG')
  const { isAuthenticated } = useAuth()

  const subscriptionsQuery = useQuery({
    queryKey: ['subscription', 'mine'],
    queryFn: listMySubscriptions,
    enabled: isAuthenticated,
  })

  const liveSubscriptions = subscriptionsQuery.data?.subscriptions
  const latestSubscription = liveSubscriptions?.[0] ?? null
  const hasLiveSubscription = Boolean(latestSubscription)

  const saladsQuery = useQuery({
    queryKey: ['subscription', 'salads'],
    queryFn: listSubscribableSalads,
  })

  const rawPlans = saladsQuery.data?.plans

  const subscribablePlans = useMemo(() => {
    const plans = rawPlans ?? []
    const live = liveSubscriptions ?? []
    const subscribedPlanIds = new Set(live.map((s) => s.plan_id))
    return plans.filter((plan) => !subscribedPlanIds.has(plan.id))
  }, [rawPlans, liveSubscriptions])

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

  return (
    <div className="mt-10">
      {subscriptionsQuery.isLoading ? (
        <OrderStripSkeleton />
      ) : hasLiveSubscription ? (
        <Link
          to="/subscription"
          className="group flex items-center gap-3 rounded-2xl border border-dashed border-chili-300 bg-chili-100/50 px-4 py-3 transition-colors hover:bg-chili-100/80 shadow-xs"
        >
          <span className="flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-chili-600" />
          <span className="min-w-0 flex-1 text-xs sm:text-sm">
            <span className="font-bold text-ink-900">{formatStatusLabel(latestSubscription.status)}</span>
            <span className="text-ink-500"> · {latestSubscription.plan_name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-chili-600">
            <span>Manage</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      ) : null}

      <div className={hasLiveSubscription || subscriptionsQuery.isLoading ? 'mt-8' : ''}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-chili-600">
              Scheduled Delivery Plans
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink-900 sm:text-3xl">
              Weekly Meal & Pickle Subscriptions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-500 leading-relaxed">
              Freshly prepared traditional South Indian recipes, delivered to your door on schedule.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-ink-500">
          <span className="flex items-center gap-1.5">
            <CalendarX2 className="h-3.5 w-3.5 text-chili-600" />
            Skip any delivery date with one tap
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-chili-600" />
            Pause, resume, or switch plans anytime
          </span>
        </div>

        <div className="mt-5">
          <CategoryPicker selected={category} onSelect={setCategory} counts={saladsQuery.isSuccess ? counts : undefined} />
        </div>

        <div className="mt-6">
          {saladsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : saladsQuery.isError ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-chili-200 bg-chili-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-50 text-chili-600 shadow-xs">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">Could not load subscription plans</p>
                  <p className="text-xs text-ink-500">Please check your network and try again.</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saladsQuery.refetch()}
                className="shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
            </div>
          ) : availablePlans.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-5 py-12 text-center">
              <Utensils className="h-8 w-8 text-ink-300" strokeWidth={1.5} />
              <p className="font-serif text-base font-bold text-ink-900">
                No {category === 'VEG' ? 'vegetarian' : 'non-vegetarian'} plans available right now
              </p>
              <p className="text-xs text-ink-500">
                Switch to {category === 'VEG' ? 'Non-veg' : 'Veg'}, or check back soon.
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
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-cream-300 px-4 py-3 bg-cream-50/50">
      <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-cream-300" />
      <div className="h-3.5 flex-1 animate-pulse rounded bg-cream-200" />
      <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-cream-200" />
    </div>
  )
}