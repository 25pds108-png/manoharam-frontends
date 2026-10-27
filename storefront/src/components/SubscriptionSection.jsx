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
    <div className="mt-8">
      {subscriptionsQuery.isLoading ? (
        <OrderStripSkeleton />
      ) : hasLiveSubscription ? (
        <Link
          to="/subscription"
          className="group flex items-center gap-3 rounded-xl border border-dashed border-[#9B2C2C]/40 bg-[#FCE4E4]/40 px-4 py-3 transition-colors hover:bg-[#FCE4E4]/60"
        >
          <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#9B2C2C]" />
          <span className="min-w-0 flex-1 text-xs sm:text-sm">
            <span className="font-bold text-[#1C1917]">{formatStatusLabel(latestSubscription.status)}</span>
            <span className="text-[#78716C]"> · {latestSubscription.plan_name}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
            <span>Manage</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      ) : null}

      <div className={hasLiveSubscription || subscriptionsQuery.isLoading ? 'mt-7' : ''}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B2C2C]">
              Scheduled Delivery Plans
            </span>
            <h2 className="mt-0.5 font-serif text-2xl font-bold text-[#1C1917] sm:text-3xl">
              Weekly Meal & Pickle Subscriptions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#78716C]">
              Freshly prepared traditional South Indian recipes, delivered to your door on schedule.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-[#78716C]">
          <span className="flex items-center gap-1.5">
            <CalendarX2 className="h-3.5 w-3.5 text-[#9B2C2C]" />
            Skip any delivery date with one tap
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5 text-[#9B2C2C]" />
            Pause, resume, or switch plans anytime
          </span>
        </div>

        <div className="mt-4">
          <CategoryPicker selected={category} onSelect={setCategory} counts={saladsQuery.isSuccess ? counts : undefined} />
        </div>

        <div className="mt-4">
          {saladsQuery.isLoading ? (
            <PlansSkeleton />
          ) : saladsQuery.isError ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#F9C5C5] bg-[#FDF2F2] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#9B2C2C] shadow-xs">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">Could not load subscription plans</p>
                  <p className="text-xs text-[#78716C]">Please check your network and try again.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => saladsQuery.refetch()}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#9B2C2C]/30 bg-white px-4 py-2 text-xs font-bold text-[#9B2C2C] shadow-xs hover:bg-[#9B2C2C] hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : availablePlans.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] px-5 py-10 text-center">
              <Utensils className="h-6 w-6 text-[#A8A29E]" />
              <p className="font-serif text-base font-bold text-[#1C1917]">
                No {category === 'VEG' ? 'vegetarian' : 'non-vegetarian'} plans available right now
              </p>
              <p className="text-xs text-[#78716C]">
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
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#E6D9C5] px-4 py-3">
      <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#E6D9C5]" />
      <div className="h-3.5 flex-1 animate-pulse rounded bg-[#F3EBDD]" />
      <div className="h-3 w-14 shrink-0 animate-pulse rounded bg-[#F3EBDD]" />
    </div>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#E6D9C5] bg-white p-3 shadow-xs">
          <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-[#F3EBDD]" />
          <div className="space-y-2 pt-3">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#F3EBDD]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#F3EBDD]" />
          </div>
        </div>
      ))}
    </div>
  )
}