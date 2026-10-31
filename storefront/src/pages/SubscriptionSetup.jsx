import { useMemo, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Calendar as CalendarIcon, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { HorizontalStepper } from '../components/ui/Stepper'
import ScheduleCalendar from '../components/subscription/ScheduleCalendar'
import { listSubscribableSalads, listServiceHolidays } from '../api/subscriptions'
import {
  WEEK_OPTIONS,
  buildSchedule,
  formatISODate,
  getSelectableRange,
} from '../lib/subscriptionSchedule'

const SETUP_STEPS = [
  { label: 'Select Plan' },
  { label: 'Set Schedule' },
  { label: 'Review & Confirm' },
]

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
        <div className="py-24 text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Loading plan schedule options…</p>
        </div>
      </AppShell>
    )
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="py-24 px-4 text-center max-w-md mx-auto">
          <p className="font-serif text-xl font-bold text-ink-900">Plan Not Found</p>
          <p className="mt-2 text-xs text-ink-500">We couldn't retrieve the requested subscription plan details.</p>
          <Link to="/subscription" className="mt-6 inline-block">
            <Button variant="primary" size="md">
              Browse Available Plans
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const deliveryCount = schedule?.days.filter((d) => !d.excluded).length ?? 0

  return (
    <AppShell maxWidth="max-w-3xl">
      <div className="px-4 pb-48 pt-4 sm:px-6 md:pb-36 space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-ink-500 hover:text-chili-600 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Plan Details</span>
        </button>

        {/* 3-Step Progress Indicator */}
        <div className="mx-auto max-w-lg py-2">
          <HorizontalStepper steps={SETUP_STEPS} currentStep={1} />
        </div>

        <div className="border-b border-cream-300 pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-chili-600 block">
            Step 1 of 2: Schedule & Delivery
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 mt-1">{plan.name}</h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-500">
            ₹{Number(plan.price_per_week).toFixed(0)} /week · Select starting date, cycle duration, and weekend options.
          </p>
        </div>

        {/* Start Date Calendar Card */}
        <Card className="p-6 sm:p-7 space-y-4 rounded-3xl border-cream-300 shadow-xs">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chili-100 text-chili-600">
                <CalendarIcon className="h-4.5 w-4.5" />
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900">1. Select Start Date</h2>
            </div>
            {startDate ? (
              <span className="text-xs font-bold text-chili-600 bg-chili-50 px-2.5 py-1 rounded-md border border-chili-200">
                {formatISODate(startDate)}
              </span>
            ) : null}
          </div>

          <p className="text-xs text-ink-500 leading-relaxed">
            Choose any starting date from tomorrow up to 45 days in advance. Meals are freshly slow-cooked and dispatched each morning.
          </p>

          <div className="rounded-2xl border border-cream-300 bg-cream-100/70 p-4">
            <ScheduleCalendar
              minDate={minDate}
              maxDate={maxDate}
              selectedStart={startDate}
              scheduleDays={schedule?.days ?? []}
              onSelectDate={setStartDate}
            />
          </div>

          {holidays.length > 0 ? (
            <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-800 leading-relaxed space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Upcoming Kitchen / Service Holidays:</span>
              </span>
              <p className="text-[11px] text-amber-700/90">
                {holidays.map((h) => `${h.holiday_date} (${h.reason})`).join(', ')}
              </p>
            </div>
          ) : null}
        </Card>

        {/* Duration Card */}
        <Card className="p-6 sm:p-7 space-y-4 rounded-3xl border-cream-300 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-cream-300 pb-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900">2. Service Duration</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {WEEK_OPTIONS.map((w) => {
              const isSelected = weeks === w
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeeks(w)}
                  className={`rounded-2xl py-3.5 px-3 text-center transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500 ${
                    isSelected
                      ? 'bg-chili-600 text-cream-50 shadow-md ring-2 ring-chili-600/30'
                      : 'border border-cream-300 bg-cream-100 text-ink-700 hover:bg-cream-200 hover:border-chili-300'
                  }`}
                >
                  <span className="block text-sm sm:text-base font-serif font-bold">
                    {w} {w === 1 ? 'Week' : 'Weeks'}
                  </span>
                  <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-cream-200' : 'text-ink-500'}`}>
                    ₹{(plan.price_per_week * w).toFixed(0)} total
                  </span>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Weekend Exclusions Card */}
        <Card className="p-6 sm:p-7 space-y-4 rounded-3xl border-cream-300 shadow-xs">
          <h2 className="font-serif text-base sm:text-lg font-bold text-ink-900 border-b border-cream-300 pb-3.5">
            3. Weekend Delivery Preferences
          </h2>
          <div className="space-y-3">
            <ToggleRow label="Skip Saturday deliveries" description="Deliveries pause on Saturdays" checked={excludeSaturday} onChange={setExcludeSaturday} />
            <ToggleRow label="Skip Sunday deliveries" description="Deliveries pause on Sundays" checked={excludeSunday} onChange={setExcludeSunday} />
          </div>
        </Card>

        {/* Delivery Summary Banner */}
        {schedule ? (
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 text-center text-xs text-ink-700 shadow-2xs space-y-1">
            <p>
              <span className="font-serif text-sm font-bold text-chili-600">{deliveryCount} scheduled meal deliveries</span>
            </p>
            <p className="text-[11px] text-ink-500">
              Delivery cycle completes on{' '}
              <span className="font-semibold text-ink-900">
                {new Date(schedule.endDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </p>
          </div>
        ) : null}
      </div>

      {/* Sticky Bottom Confirmation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-100/95 p-4 backdrop-blur-md shadow-2xl">
        <div className="mx-auto max-w-3xl flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Calculated Cycle Rate</p>
            <p className="font-serif text-lg font-bold text-ink-900">
              {weeks} {weeks === 1 ? 'Week' : 'Weeks'} · <span className="text-chili-600 font-bold">₹{(plan.price_per_week * weeks).toFixed(0)}</span>
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 sm:flex-initial sm:min-w-[280px] shadow-md py-3.5"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            <span>{startDate ? 'Review Daily Schedule' : 'Pick a start date to continue'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      className="flex w-full items-center justify-between rounded-2xl bg-cream-100/70 border border-cream-300/80 p-4 text-left transition-colors hover:bg-cream-200/70 focus-visible:outline-none"
    >
      <div>
        <span className="block text-xs sm:text-sm font-bold text-ink-900">{label}</span>
        {description ? <span className="block text-[11px] text-ink-500 mt-0.5">{description}</span> : null}
      </div>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-chili-600' : 'bg-cream-300'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-cream-50 shadow-xs transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}