/**
 * Pure scheduling helpers for the subscription flow.
 *
 * `calculateEndDate` mirrors the server-side logic in
 * `user_routes/subscribe_plan.php` (`calculateEndDate()`) so the UI can
 * preview an accurate delivery schedule *before* the subscription is
 * created. If the backend logic ever changes, update both places together.
 */

export const MIN_WEEKS = 1
export const MAX_WEEKS = 4
export const WEEK_OPTIONS = Array.from({ length: MAX_WEEKS }, (_, i) => i + 1)

// Selectable window for a plan's start date: tomorrow .. +45 days ("1.5 months").
export const MIN_START_OFFSET_DAYS = 1
export const MAX_START_OFFSET_DAYS = 45

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DAY_MS = 24 * 60 * 60 * 1000

export function toDateOnly(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatISODate(date) {
  const d = toDateOnly(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getSelectableRange() {
  const today = toDateOnly(new Date())
  const min = new Date(today.getTime() + MIN_START_OFFSET_DAYS * DAY_MS)
  const max = new Date(today.getTime() + MAX_START_OFFSET_DAYS * DAY_MS)
  return { min, max }
}

export function isDateSelectable(date) {
  const { min, max } = getSelectableRange()
  const d = toDateOnly(date)
  return d >= min && d <= max
}

/**
 * Mirrors calculateEndDate() in subscribe_plan.php: counts `weeks * 7`
 * *delivered* days forward from start_date, skipping excluded weekend days.
 */
export function calculateEndDate(startDate, weeks, excludeSaturday, excludeSunday) {
  const requiredDays = weeks * 7
  let current = toDateOnly(startDate)
  let completedDays = 0

  while (completedDays < requiredDays) {
    const day = current.getDay() // 0=Sun..6=Sat
    const isSkipped = (day === 6 && excludeSaturday) || (day === 0 && excludeSunday)
    if (!isSkipped) completedDays += 1
    if (completedDays < requiredDays) {
      current = new Date(current.getTime() + DAY_MS)
    }
  }

  return current
}

/**
 * Builds the full list of calendar days between start and end (inclusive),
 * flagging which are excluded (Sat/Sun opt-out) vs. delivered, and — for
 * delivered days — which product from the plan is scheduled, cycling
 * through `products` in delivery_order.
 *
 * Excluded weekend days are included in the result (with `excluded: true`,
 * `product: null`) so calendars/lists can show the full span, not just
 * delivery days.
 */
export function buildSchedule({ startDate, weeks, excludeSaturday, excludeSunday, products }) {
  const start = toDateOnly(startDate)
  const end = calculateEndDate(start, weeks, excludeSaturday, excludeSunday)
  const orderedProducts = [...(products ?? [])].sort(
    (a, b) => a.delivery_order - b.delivery_order,
  )

  const days = []
  let current = new Date(start)
  let deliveryIndex = 0

  while (current <= end) {
    const day = current.getDay()
    const excluded = (day === 6 && excludeSaturday) || (day === 0 && excludeSunday)
    const product =
      excluded || orderedProducts.length === 0
        ? null
        : orderedProducts[deliveryIndex % orderedProducts.length]

    days.push({
      date: formatISODate(current),
      dayOfWeek: day,
      excluded,
      product,
    })

    if (!excluded) deliveryIndex += 1
    current = new Date(current.getTime() + DAY_MS)
  }

  return { startDate: formatISODate(start), endDate: formatISODate(end), days }
}
