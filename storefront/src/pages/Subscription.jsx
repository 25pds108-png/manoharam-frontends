import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight, Clock3, CalendarCheck, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
import { listMySubscriptions, getSubscriptionDetails } from '../api/subscriptions'

export default function Subscription() {
  const listQuery = useQuery({
    queryKey: ['subscription', 'mine'],
    queryFn: listMySubscriptions,
  })

  const liveSubscriptions = listQuery.data?.subscriptions ?? []

  const detailQueries = useQueries({
    queries: liveSubscriptions.map((subscription) => ({
      queryKey: ['subscription', 'details', subscription.id],
      queryFn: () => getSubscriptionDetails(subscription.id),
    })),
  })

  return (
    <AppShell maxWidth="max-w-2xl">
      <PageHeader title="My Meal Subscriptions" />

      <div className="px-4 py-4 sm:px-6">
        {listQuery.isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
            <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading your subscriptions…</p>
          </div>
        ) : listQuery.isError ? (
          <div className="rounded-xl border border-[#F9C5C5] bg-[#FDF2F2] p-6 text-center">
            <p className="font-serif text-sm font-bold text-[#9B2C2C]">
              Couldn't load your subscriptions
            </p>
            <p className="mt-1 text-xs text-[#78716C]">Please pull down or refresh to retry.</p>
          </div>
        ) : liveSubscriptions.length > 0 ? (
          <div className="space-y-3.5">
            {liveSubscriptions.map((subscription, index) => (
              <SubscriptionStatusCard
                key={subscription.id}
                subscription={subscription}
                detail={detailQueries[index]?.data}
              />
            ))}
          </div>
        ) : (
          <NoSubscription />
        )}
      </div>
    </AppShell>
  )
}

function NoSubscription() {
  return (
    <div className="flex flex-col items-center py-20 text-center max-w-md mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE4E4] text-[#9B2C2C] shadow-inner">
        <CalendarCheck className="h-9 w-9 stroke-[1.5]" />
      </div>
      <h2 className="mt-5 font-serif text-2xl font-bold text-[#1C1917]">
        No active subscription
      </h2>
      <p className="mt-1 text-xs text-[#78716C] leading-relaxed">
        Choose a wholesome weekly meal or pickle plan to receive fresh, pure homemade food delivered on schedule.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#9B2C2C] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
      >
        <span>Explore Weekly Plans</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
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
            <h2 className="font-serif text-base font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors">
              {subscription.plan_name}
            </h2>
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