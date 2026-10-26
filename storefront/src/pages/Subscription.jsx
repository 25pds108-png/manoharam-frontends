import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight, Clock3, Salad } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge, { formatStatusLabel } from '../components/ui/Badge'
import { listMySubscriptions, getSubscriptionDetails } from '../api/subscriptions'

export default function Subscription() {
  const listQuery = useQuery({
    queryKey: ['subscription', 'mine'],
    queryFn: listMySubscriptions,
  })

  // list_my_subscriptions.php already filters to PENDING/ACTIVE only, so
  // there's no client-side status filter needed here anymore.
  const liveSubscriptions = listQuery.data?.subscriptions ?? []

  // The list endpoint only returns { id, plan_id, start_date, end_date,
  // status, plan_name } — price, description, and the linked products live
  // on get_my_subscription_details.php, fetched per subscription here.
  const detailQueries = useQueries({
    queries: liveSubscriptions.map((subscription) => ({
      queryKey: ['subscription', 'details', subscription.id],
      queryFn: () => getSubscriptionDetails(subscription.id),
    })),
  })

  return (
    <AppShell>
      <PageHeader title="My subscription" />

      <div className="px-4 md:mx-auto md:max-w-xl">
        {listQuery.isLoading ? (
          <p className="py-16 text-center text-ink-300">Loading…</p>
        ) : listQuery.isError ? (
          <p className="py-16 text-center text-chili-500">
            Couldn't load your subscriptions. Pull down to retry.
          </p>
        ) : liveSubscriptions.length > 0 ? (
          <div className="space-y-3">
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
    <div className="mt-4 flex flex-col items-center gap-3 rounded-card bg-white px-5 py-14 text-center shadow-md shadow-ink-900/5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-chili-50 text-chili-500">
        <Salad className="h-5 w-5" />
      </div>
      <h2 className="font-display text-lg font-semibold text-ink-900">No active subscription</h2>
      <p className="max-w-xs text-sm text-ink-500">
        Pick a plan and it'll show up here with your delivery dates and skip options.
      </p>
      <Link
        to="/"
        className="mt-1 inline-flex items-center gap-1 rounded-pill bg-chili-500 px-5 py-2.5 text-sm font-semibold text-cream-50 transition-colors duration-200 hover:bg-chili-600"
      >
        Browse today's menu
      </Link>
    </div>
  )
}

/**
 * Returns 0–100, or null if either date is missing/unparseable or the
 * window hasn't started yet (nothing to show before day one).
 */
function deliveryProgress(startDate, endDate) {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  const now = Date.now()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start || now < start) return null
  return Math.min(100, Math.round(((now - start) / (end - start)) * 100))
}

/**
 * `subscription` is the summary row from list_my_subscriptions.php (id,
 * plan_id, start_date, end_date, status, plan_name — always available).
 * `detail` is the matching get_my_subscription_details.php response,
 * fetched separately per card, so price/description/products render once
 * that call resolves rather than blocking the whole list on it.
 *
 * The whole card is a Link into /subscriptions/:id, which re-fetches (and
 * caches, via the same ['subscription','details', id] query key) the full
 * detail payload on SubscriptionDetails.
 *
 * Redesigned from a full-bleed gradient hero to a lighter card with a
 * status-colored left accent: the gradient treatment reads well for one
 * subscription but competes with itself once a customer has two or three
 * live at once (multiple concurrent subscriptions are allowed — see
 * SubscriptionSection). ACTIVE subscriptions also get a real progress bar
 * computed from start_date/end_date, since "day 12 of 30" is more useful
 * at a glance than a plain date range.
 */
function SubscriptionStatusCard({ subscription, detail }) {
  const isPending = subscription.status === 'PENDING'
  const isActive = subscription.status === 'ACTIVE'
  const details = detail?.subscription
  const products = detail?.products ?? []
  const progress = isActive ? deliveryProgress(subscription.start_date, subscription.end_date) : null

  return (
    <Link to={`/subscriptions/${subscription.id}`} className="block">
      <Card
        className={[
          'overflow-hidden border-l-4 p-0 shadow-md shadow-ink-900/5 ring-1 ring-ink-900/[0.04]',
          'transition-shadow duration-200 hover:shadow-lg hover:shadow-ink-900/10',
          isPending ? 'border-l-warning-500' : isActive ? 'border-l-success-500' : 'border-l-ink-900/10',
        ].join(' ')}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge tone={isPending ? 'warning' : isActive ? 'success' : 'neutral'}>
              {formatStatusLabel(subscription.status)}
            </Badge>
            {details?.price_per_week !== undefined ? (
              <p className="text-sm font-semibold text-ink-900">₹{details.price_per_week}/week</p>
            ) : null}
          </div>

          <div className="mt-2.5 flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink-900">{subscription.plan_name}</h2>
            <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-ink-300" />
          </div>

          {products.length > 0 || details?.description ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">
              {products.length > 0 ? products.map((p) => p.name).join(' → ') : details?.description}
            </p>
          ) : null}

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-ink-400">
            <CalendarClock className="h-3.5 w-3.5" />
            {subscription.start_date} – {subscription.end_date}
          </div>

          {progress !== null ? (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-900/[0.06]">
                <div className="h-full rounded-full bg-success-500" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-ink-400">{progress}% through this cycle</p>
            </div>
          ) : null}
        </div>

        {isPending ? (
          <div className="flex items-start gap-2.5 border-t border-ink-900/[0.06] bg-warning-100/40 px-4 py-3 text-sm text-ink-700">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-warning-500" />
            <p>We're reviewing your request — you'll be notified once it's approved.</p>
          </div>
        ) : null}
      </Card>
    </Link>
  )
}