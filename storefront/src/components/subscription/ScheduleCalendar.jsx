import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatISODate, toDateOnly, WEEKDAY_LABELS } from '../../lib/subscriptionSchedule'

/**
 * Single-select month calendar for choosing a subscription start date.
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
    <div className="select-none">
      <div className="flex items-center justify-between px-2 pb-3 border-b border-cream-300/80">
        <button
          type="button"
          onClick={() => canGoPrev && shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 border border-cream-300 text-ink-700 shadow-2xs hover:bg-cream-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <p className="font-serif text-sm font-bold text-ink-900 tracking-wide">
          {visibleMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </p>

        <button
          type="button"
          onClick={() => canGoNext && shiftMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-50 border border-cream-300 text-ink-700 shadow-2xs hover:bg-cream-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-ink-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">{label}</span>
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-7 gap-1.5">
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
  const base = 'aspect-square rounded-xl text-xs font-semibold transition-all flex items-center justify-center'
  if (disabled) return `${base} text-ink-300 opacity-40 cursor-not-allowed`
  if (isStart) return `${base} bg-chili-600 text-cream-50 font-bold shadow-md scale-105 ring-2 ring-chili-600/30`
  if (scheduleDay?.excluded) return `${base} bg-cream-200/60 text-ink-400 line-through`
  if (scheduleDay) return `${base} bg-amber-100 text-amber-800 font-bold border border-amber-300/60`
  return `${base} bg-cream-50 text-ink-900 border border-cream-300/80 hover:bg-cream-200 hover:border-chili-400 shadow-2xs active:scale-95`
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
