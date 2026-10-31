import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  LogIn,
  Utensils,
  RefreshCw,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
import { PlanCardSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { listMySubscriptions, getSubscriptionDetails, listSubscribableSalads } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'
import { useAuth } from '../context/AuthContext'
import CategoryPicker from '../components/subscription/CategoryPicker'
import PlanCard from '../components/subscription/PlanCard'

export default function Subscription() {
  const { isAuthenticated } = useAuth()
  const [category, setCategory] = useState('VEG')

  // Only query user-specific subscriptions if authenticated
  const listQuery = useQuery({
    queryKey: ['subscription', 'mine'],
    queryFn: listMySubscriptions,
    enabled: isAuthenticated,
  })

  const liveSubscriptions = listQuery.data?.subscriptions ?? []

  const detailQueries = useQueries({
    queries: liveSubscriptions.map((subscription) => ({
      queryKey: ['subscription', 'details', subscription.id],
      queryFn: () => getSubscriptionDetails(subscription.id),
    })),
  })

  // Public catalog of subscription plans (no login required)
  const plansQuery = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: listSubscribableSalads,
  })

  const plansData = plansQuery.data?.plans
  const subscriptionsData = listQuery.data?.subscriptions

  // Filter out plans the user is already actively subscribed to
  const subscribablePlans = useMemo(() => {
    const rawPlans = plansData ?? []
    const live = subscriptionsData ?? []
    const subscribedPlanIds = new Set(live.map((s) => s.plan_id))
    return rawPlans.filter((plan) => !subscribedPlanIds.has(plan.id))
  }, [plansData, subscriptionsData])

  // Count plans by category for CategoryPicker
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

  // Filter plans based on the selected dietary tab
  const filteredPlans = useMemo(() => {
    return subscribablePlans.filter((plan) => getPlanDietaryType(plan) === category)
  }, [subscribablePlans, category])

  return (
    <AppShell maxWidth="max-w-6xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
        {/* Active Subscriptions Section (for logged-in customers with active plans) */}
        {isAuthenticated && liveSubscriptions.length > 0 ? (
          <section className="rounded-3xl border border-cream-300 bg-cream-50 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between gap-3 border-b border-cream-300 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-chili-600 block">
                  Your Ongoing Service
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 mt-0.5">
                  Active Subscriptions ({liveSubscriptions.length})
                </h2>
              </div>
              <span className="flex items-center gap-2 text-xs font-bold text-success-600 bg-success-50 px-3 py-1 rounded-full border border-success-200">
                <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
                Live Cycle
              </span>
            </div>

            <div className="space-y-4">
              {liveSubscriptions.map((subscription, index) => (
                <SubscriptionStatusCard
                  key={subscription.id}
                  subscription={subscription}
                  detail={detailQueries[index]?.data}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Editorial Page Header & Value Proposition */}
        <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/70 border border-amber-300/60 px-4 py-1 text-xs font-serif italic text-chili-700">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>“Safe, as your mother&apos;s home.”</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900">
            Weekly Food & Meal Subscriptions
          </h1>

          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-normal">
            Wholesome South Indian cooking delivered fresh on your schedule. 100% cold-pressed oils, zero preservatives, and effortless 1-tap date skipping anytime.
          </p>

          {/* Compact Category Switcher — Clean, centered and balanced */}
          <div className="pt-2">
            <CategoryPicker selected={category} onSelect={setCategory} counts={counts} />
          </div>
        </div>

        {/* Plans Grid */}
        <section aria-label="Available subscription meal plans">
          {plansQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <PlanCardSkeleton key={i} />
              ))}
            </div>
          ) : plansQuery.isError ? (
            <div className="rounded-3xl border border-chili-200 bg-chili-50 p-8 text-center space-y-3 max-w-md mx-auto">
              <p className="font-serif text-lg font-bold text-chili-600">
                Couldn&apos;t load subscription plans
              </p>
              <p className="text-xs text-ink-500">
                Please check your internet connection or try again.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => plansQuery.refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            </div>
          ) : filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-cream-300 bg-cream-50 p-12 text-center max-w-md mx-auto space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-100 text-ink-400 border border-cream-300">
                <Utensils className="h-7 w-7 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-ink-900">
                No {category === 'VEG' ? 'Pure Vegetarian' : 'Non-Vegetarian'} plans currently available
              </h3>
              <p className="text-xs text-ink-500 leading-relaxed">
                Please select another category or check back soon as our kitchen regularly announces new meal rotations.
              </p>
            </div>
          )}
        </section>

        {/* How Subscriptions Work 3-Step Guide */}
        <section className="rounded-3xl border border-cream-300 bg-cream-50 p-8 sm:p-10 shadow-xs">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-chili-600 block">
              Simple & Flexible
            </span>
            <h2 className="font-serif text-2xl font-bold text-ink-900">
              How Manoharam Subscriptions Work
            </h2>
            <p className="text-xs text-ink-500 leading-relaxed">
              Wholesome home meals without the daily hassle of ordering.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-100/70 border border-cream-300/70 space-y-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chili-600 text-cream-50 font-serif font-bold text-sm shadow-xs">
                1
              </span>
              <h3 className="font-serif text-base font-bold text-ink-900">
                Choose Your Plan
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Pick your preferred weekly menu rotation, handcrafted pickle box, or lunch packs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-100/70 border border-cream-300/70 space-y-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-cream-50 font-serif font-bold text-sm shadow-xs">
                2
              </span>
              <h3 className="font-serif text-base font-bold text-ink-900">
                Set Your Schedule
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Select your start date (1–4 weeks duration). Exclude weekends or skip specific days.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-cream-100/70 border border-cream-300/70 space-y-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success-600 text-cream-50 font-serif font-bold text-sm shadow-xs">
                3
              </span>
              <h3 className="font-serif text-base font-bold text-ink-900">
                Fresh Daily Comfort
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Freshly cooked food arrives at your door every morning. Skip any date with 1 tap.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Banner (if not logged in) */}
        {!isAuthenticated ? (
          <div className="rounded-3xl border border-cream-300 bg-gradient-to-r from-cream-50 via-cream-100 to-amber-50/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <p className="font-serif text-lg font-bold text-ink-900">
                Already have an active subscription with us?
              </p>
              <p className="text-xs text-ink-500 mt-1">
                Sign in to manage your schedule, pause dates, or view today&apos;s meal delivery.
              </p>
            </div>
            <Link
              to="/login"
              state={{ from: { pathname: '/subscription' } }}
              className="shrink-0"
            >
              <Button variant="primary" size="md">
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}

function deliveryProgress(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start || now < start) return null
  return Math.min(100, Math.round(((now - start) / (end - start)) * 100))
}

function SubscriptionStatusCard({ subscription, detail }) {
  const isPending = subscription.status === 'PENDING'
  const isActive = subscription.status === 'ACTIVE'
  const details = detail?.subscription
  const products = detail?.products ?? []
  const progress = isActive ? deliveryProgress(subscription.start_date, subscription.end_date) : null

  return (
    <Link to={`/subscriptions/${subscription.id}`} className="block group">
      <div className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-chili-300 hover:shadow-md">
        <div className="flex items-center justify-between gap-3">
          <Badge tone={isPending ? 'warning' : isActive ? 'success' : 'neutral'}>
            {formatStatusLabel(subscription.status)}
          </Badge>
          {details?.price_per_week !== undefined ? (
            <p className="font-serif text-sm font-bold text-chili-600 tabular-nums">
              ₹{Number(details.price_per_week).toFixed(0)}/week
            </p>
          ) : null}
        </div>

        <div className="mt-3.5 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-ink-900 group-hover:text-chili-600 transition-colors">
              {subscription.plan_name}
            </h3>
            {products.length > 0 || details?.description ? (
              <p className="mt-1 line-clamp-1 text-xs text-ink-500">
                {products.length > 0 ? products.map((p) => p.name).join(' · ') : details?.description}
              </p>
            ) : null}
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-ink-400 group-hover:text-chili-600 group-hover:translate-x-1 transition-all" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
          <CalendarClock className="h-4 w-4 text-chili-600" />
          <span>
            {subscription.start_date} – {subscription.end_date}
          </span>
        </div>

        {progress !== null ? (
          <div className="mt-3.5 border-t border-cream-300 pt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-cream-200">
              <div className="h-full rounded-full bg-success-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-ink-500 font-medium">{progress}% through this delivery cycle</p>
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="leading-relaxed">Our kitchen is reviewing your subscription request — you will be notified upon confirmation.</p>
          </div>
        ) : null}
      </div>
    </Link>
  )
}