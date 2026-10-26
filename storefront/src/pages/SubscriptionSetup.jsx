import { useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ScheduleCalendar from '../components/subscription/ScheduleCalendar'
import { listSubscribableSalads, listServiceHolidays } from '../api/subscriptions'
import {
  WEEK_OPTIONS,
  buildSchedule,
  formatISODate,
  getSelectableRange,
} from '../lib/subscriptionSchedule'

/**
 * Step 1 of the subscribe flow, at /subscribe/:planId: pick a start date,
 * duration (1-4 weeks) and whether to exclude weekends — all on one page,
 * with a live preview of which days that produces.
 *
 * The plan is normally handed down via router state (from PlanCard, so no
 * refetch is needed). On a hard refresh or a direct link, that state is
 * missing, so this falls back to fetching the full plan list and finding
 * it by id — the same data SubscriptionSection already uses.
 */
export default function SubscriptionSetup() {
  const { planId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const planFromState = location.state?.plan ?? null

  const plansQuery = useQuery({
    queryKey: ['subscription', 'salads'],
    queryFn: listSubscribableSalads,
    enabled: !planFromState,
  })

  const holidaysQuery = useQuery({
    queryKey: ['service-holidays'],
    queryFn: () => listServiceHolidays(),
  })
  const holidays = holidaysQuery.data?.holidays ?? []

  const plan =
    planFromState ?? plansQuery.data?.plans?.find((p) => String(p.id) === String(planId)) ?? null

  const { min: minDate, max: maxDate } = useMemo(() => getSelectableRange(), [])

  const [startDate, setStartDate] = useState(null)
  const [weeks, setWeeks] = useState(1)
  const [excludeSaturday, setExcludeSaturday] = useState(false)
  const [excludeSunday, setExcludeSunday] = useState(false)

  const schedule = useMemo(() => {
    if (!startDate || !plan) return null
    return buildSchedule({
      startDate,
      weeks,
      excludeSaturday,
      excludeSunday,
      products: plan.products,
    })
  }, [startDate, weeks, excludeSaturday, excludeSunday, plan])

  const canContinue = Boolean(startDate && plan)

  const handleContinue = () => {
    if (!canContinue) return
    navigate(`/subscribe/${planId}/review`, {
      state: {
        plan,
        startDate: formatISODate(startDate),
        weeks,
        excludeSaturday,
        excludeSunday,
      },
    })
  }

  if (!planFromState && plansQuery.isLoading) {
    return (
      <AppShell>
        <p className="p-6 text-center text-ink-300">Loading plan…</p>
      </AppShell>
    )
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="p-6 text-center">
          <p className="text-ink-500">We couldn't find that plan.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-chili-500">
            Back to home
          </Link>
        </div>
      </AppShell>
    )
  }

  const deliveryCount = schedule?.days.filter((d) => !d.excluded).length ?? 0

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 pb-44 pt-4 sm:px-6 md:pb-28">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm font-medium text-ink-500"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="font-display mt-3 text-2xl font-semibold text-ink-900">{plan.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          ₹{plan.price_per_week}
          <span className="text-ink-300">/week</span> · Choose when your deliveries start
        </p>

        <Card className="mt-5 p-4">
          <h2 className="font-display text-base font-semibold text-ink-900">Start date</h2>
          <p className="mt-0.5 text-xs text-ink-500">
            Choose any day from tomorrow up to 1.5 months out
          </p>
          <div className="mt-3">
            <ScheduleCalendar
              minDate={minDate}
              maxDate={maxDate}
              selectedStart={startDate}
              scheduleDays={schedule?.days ?? []}
              onSelectDate={setStartDate}
            />
          </div>

          {holidays.length > 0 ? (
            <div className="mt-3 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-800">
              <span className="font-semibold">Upcoming Kitchen / Service Holidays: </span>
              <span>{holidays.map((h) => `${h.holiday_date} (${h.reason})`).join(', ')}</span>
            </div>
          ) : null}
        </Card>

        <Card className="mt-4 p-4">
          <h2 className="font-display text-base font-semibold text-ink-900">Duration</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {WEEK_OPTIONS.map((w) => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                className={`rounded-pill py-2.5 text-sm font-semibold transition-colors ${
                  weeks === w
                    ? 'bg-chili-500 text-cream-50 shadow-sm shadow-chili-900/20'
                    : 'bg-cream-100 text-ink-700'
                }`}
              >
                {w} {w === 1 ? 'week' : 'weeks'}
              </button>
            ))}
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h2 className="font-display text-base font-semibold text-ink-900">Weekend deliveries</h2>
          <div className="mt-3 space-y-2">
            <ToggleRow label="Skip Saturdays" checked={excludeSaturday} onChange={setExcludeSaturday} />
            <ToggleRow label="Skip Sundays" checked={excludeSunday} onChange={setExcludeSunday} />
          </div>
        </Card>

        {schedule ? (
          <p className="mt-4 text-center text-sm text-ink-500">
            {deliveryCount} deliveries · ends{' '}
            {new Date(schedule.endDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-[calc(3.85rem+env(safe-area-inset-bottom))] z-30 border-t border-cream-200 bg-cream-50/95 p-4 backdrop-blur md:bottom-0 md:z-50">
        <div className="mx-auto max-w-2xl">
          <Button className="w-full" disabled={!canContinue} onClick={handleContinue}>
            {startDate ? 'Review daily schedule' : 'Pick a start date to continue'}
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex w-full items-center justify-between rounded-card bg-cream-50 px-3 py-2.5 text-left"
    >
      <span className="text-sm text-ink-700">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${
          checked ? 'bg-chili-500' : 'bg-cream-200'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}