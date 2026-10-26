import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatISODate, toDateOnly, WEEKDAY_LABELS } from '../../lib/subscriptionSchedule'

/**
 * Single-select month calendar for choosing a subscription start date.
 *
 * - Days outside [minDate, maxDate] are disabled (the "tomorrow to 1.5
 *   months out" window enforced by getSelectableRange()).
 * - Once a start date is picked, `scheduleDays` (from buildSchedule) is
 *   used to highlight the resulting delivery range, so duration and
 *   weekend-exclude changes are visible on the calendar immediately.
 */
export default function ScheduleCalendar({
  minDate,
  maxDate,
  selectedStart,
  scheduleDays,
  onSelectDate,
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = toDateOnly(minDate)
    d.setDate(1)
    return d
  })

  const scheduleByDate = useMemo(() => {
    const map = new Map()
    for (const day of scheduleDays) map.set(day.date, day)
    return map
  }, [scheduleDays])

  const cells = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth])

  const canGoPrev = firstOfMonthMs(visibleMonth) > firstOfMonthMs(minDate)
  const canGoNext = firstOfMonthMs(visibleMonth) < firstOfMonthMs(maxDate)

  const shiftMonth = (delta) => {
    setVisibleMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => canGoPrev && shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="rounded-full p-1.5 text-ink-500 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-ink-900">
          {visibleMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <button
          type="button"
          onClick={() => canGoNext && shiftMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="rounded-full p-1.5 text-ink-500 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[0.65rem] font-semibold text-ink-300">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />

          const iso = formatISODate(date)
          const disabled = date < toDateOnly(minDate) || date > toDateOnly(maxDate)
          const isStart = selectedStart && iso === formatISODate(selectedStart)
          const scheduleDay = !isStart ? scheduleByDate.get(iso) : null

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              className={cellClasses({ disabled, isStart, scheduleDay })}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function cellClasses({ disabled, isStart, scheduleDay }) {
  const base = 'aspect-square rounded-full text-xs font-medium transition-colors'
  if (disabled) return `${base} text-ink-200`
  if (isStart) return `${base} bg-chili-500 text-cream-50 font-semibold`
  if (scheduleDay?.excluded) return `${base} bg-cream-100 text-ink-300 line-through`
  if (scheduleDay) return `${base} bg-chili-50 text-chili-500 font-semibold`
  return `${base} text-ink-700 hover:bg-cream-100`
}

function firstOfMonthMs(date) {
  const d = toDateOnly(date)
  d.setDate(1)
  return d.getTime()
}

function buildMonthGrid(monthStart) {
  const start = new Date(monthStart)
  start.setDate(1)
  const leadingBlanks = start.getDay() // 0=Sun
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()

  const cells = Array(leadingBlanks).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), day))
  }
  return cells
}
