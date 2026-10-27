import { useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  Sparkles,
  ShieldCheck,
  CalendarX2,
  RotateCcw,
  LogIn,
  Utensils,
  RefreshCw,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
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
    <AppShell maxWidth="max-w-5xl">
      <PageHeader title="Weekly Subscription Plans" />

      <div className="px-4 py-4 sm:px-6 space-y-8">
        {/* Active Subscriptions Section (for logged-in customers with active plans) */}
        {isAuthenticated && liveSubscriptions.length > 0 ? (
          <section className="rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between gap-3 border-b border-[#E6D9C5] pb-3.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B2C2C]">
                  Your Ongoing Service
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                  Active Subscriptions ({liveSubscriptions.length})
                </h2>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                <span className="h-2 w-2 rounded-full bg-[#15803D] animate-pulse" />
                Live Delivery Cycle
              </span>
            </div>

            <div className="mt-4 space-y-3">
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

        {/* Hero Banner with Brand Messaging */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E6D9C5] bg-gradient-to-br from-[#FAF6EF] via-[#FFFDF9] to-[#F5ECE1] p-5 sm:p-8 shadow-xs">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[#FCE4E4] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
                <Sparkles className="h-3 w-3" />
                Scheduled Heritage Kitchen
              </span>
              <span className="font-serif text-xs italic text-[#78716C]">
                “Safe, as your mother's home.”
              </span>
            </div>

            <h1 className="mt-3 font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1C1917]">
              Freshly Delivered Weekly Meal & Pickle Plans
            </h1>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#57534E]">
              Pure, wholesome traditional South Indian comfort food crafted in small batches using 100% cold-pressed oils. Enjoy timely doorstep deliveries on a schedule that fits your daily routine, with full freedom to pause or skip dates anytime.
            </p>

            {/* Trust Highlights */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#78716C]">
              <span className="flex items-center gap-1.5">
                <CalendarX2 className="h-3.5 w-3.5 text-[#9B2C2C]" />
                Skip any delivery date with 1 tap
              </span>
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-[#9B2C2C]" />
                Pause or modify anytime
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#9B2C2C]" />
                100% Cold-Pressed Oils • Zero Preservatives
              </span>
            </div>
          </div>
        </div>

        {/* Plans Catalog Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
                Explore Our Rotations
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                Available Subscription Plans
              </h2>
              <p className="mt-0.5 text-xs text-[#78716C]">
                Browse menus, nutrition, and weekly schedules. Login is only required when you subscribe.
              </p>
            </div>
          </div>

          {/* Dietary Tabs */}
          <div className="mt-5">
            <CategoryPicker selected={category} onSelect={setCategory} counts={counts} />
          </div>

          {/* Plans Grid */}
          <div className="mt-6">
            {plansQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-xl border border-[#E6D9C5] bg-[#F5ECE1]"
                  />
                ))}
              </div>
            ) : plansQuery.isError ? (
              <div className="rounded-xl border border-[#F9C5C5] bg-[#FDF2F2] p-8 text-center">
                <p className="font-serif text-base font-bold text-[#9B2C2C]">
                  Couldn't load subscription plans
                </p>
                <p className="mt-1 text-xs text-[#78716C]">
                  Please check your internet connection or try again.
                </p>
                <button
                  type="button"
                  onClick={() => plansQuery.refetch()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#9B2C2C] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : filteredPlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-8 text-center max-w-md mx-auto">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF6EF] text-[#78716C] border border-[#E6D9C5]">
                  <Utensils className="h-6 w-6 stroke-[1.5]" />
                </div>
                <h3 className="mt-3 font-serif text-base font-bold text-[#1C1917]">
                  No {category === 'VEG' ? 'Pure Vegetarian' : 'Non-Vegetarian'} plans currently available
                </h3>
                <p className="mt-1 text-xs text-[#78716C]">
                  Please select another category or check back soon as new seasonal rotations are added.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How Subscriptions Work 3-Step Guide */}
        <section className="rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] p-6 shadow-xs">
          <div className="text-center max-w-lg mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B2C2C]">
              Simple & Flexible
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] mt-0.5">
              How Manoharam Subscriptions Work
            </h2>
            <p className="mt-1 text-xs text-[#78716C]">
              Three easy steps to enjoy healthy, comforting home meals every single day.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-[#FAF6EF] border border-[#E6D9C5]/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B2C2C] text-white font-serif font-bold text-sm shadow-xs">
                1
              </span>
              <h3 className="mt-3 font-serif text-sm font-bold text-[#1C1917]">
                Choose Your Plan
              </h3>
              <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
                Pick your preferred weekly menu rotation, handcrafted pickle delight, or seasonal lunch packs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-[#FAF6EF] border border-[#E6D9C5]/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B2C2C] text-white font-serif font-bold text-sm shadow-xs">
                2
              </span>
              <h3 className="mt-3 font-serif text-sm font-bold text-[#1C1917]">
                Set Your Schedule
              </h3>
              <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
                Select your start date and choose whether to exclude weekends. Preview your full delivery calendar.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-[#FAF6EF] border border-[#E6D9C5]/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B2C2C] text-white font-serif font-bold text-sm shadow-xs">
                3
              </span>
              <h3 className="mt-3 font-serif text-sm font-bold text-[#1C1917]">
                Fresh Daily Comfort
              </h3>
              <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
                Piping hot or freshly packed food arrives at your door every morning. Skip any date with 1 tap.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Banner (if not logged in) */}
        {!isAuthenticated ? (
          <div className="rounded-xl border border-dashed border-[#9B2C2C]/30 bg-[#FCE4E4]/30 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <div>
              <p className="font-serif text-sm font-bold text-[#1C1917]">
                Already have an active subscription with us?
              </p>
              <p className="mt-0.5 text-xs text-[#78716C]">
                Sign in to manage your schedule, pause dates, or view today's meal delivery.
              </p>
            </div>
            <Link
              to="/login"
              state={{ from: { pathname: '/subscription' } }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#9B2C2C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23] transition-colors sm:mt-0 shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
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
      <div
        className={[
          'overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-xs transition-all duration-150',
          'border-l-4 hover:border-[#9B2C2C]/30 hover:shadow-md',
          isPending
            ? 'border-l-[#D97706]'
            : isActive
            ? 'border-l-[#15803D]'
            : 'border-l-[#78716C]',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-3">
          <Badge tone={isPending ? 'warning' : isActive ? 'success' : 'neutral'}>
            {formatStatusLabel(subscription.status)}
          </Badge>
          {details?.price_per_week !== undefined ? (
            <p className="font-serif text-sm font-bold text-[#9B2C2C]">
              ₹{Number(details.price_per_week).toFixed(0)}/week
            </p>
          ) : null}
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-base font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors">
              {subscription.plan_name}
            </h3>
            {products.length > 0 || details?.description ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-[#78716C]">
                {products.length > 0 ? products.map((p) => p.name).join(' · ') : details?.description}
              </p>
            ) : null}
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#A8A29E] group-hover:text-[#9B2C2C] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#78716C]">
          <CalendarClock className="h-3.5 w-3.5 text-[#9B2C2C]" />
          <span>
            {subscription.start_date} – {subscription.end_date}
          </span>
        </div>

        {progress !== null ? (
          <div className="mt-3 border-t border-[#E6D9C5] pt-2.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#FAF6EF]">
              <div className="h-full rounded-full bg-[#15803D]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-[#78716C]">{progress}% through this cycle</p>
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FEF7DA] p-2.5 text-xs text-[#92400E]">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D97706]" />
            <p>Our kitchen is reviewing your subscription request — you will be notified upon confirmation.</p>
          </div>
        ) : null}
      </div>
    </Link>
  )
}