import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CalendarX,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  CalendarDays,
  ShieldAlert,
  Users,
  IndianRupee,
} from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import {
  listAdminServiceHolidays,
  addServiceHoliday,
  deleteServiceHoliday,
} from '../api/holidays'

// Helper to expand a start & end date into an array of ISO date strings
function getDatesInRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return []
  const start = new Date(startDateStr)
  const end = new Date(endDateStr)
  if (start > end) return []
  const dates = []
  const current = new Date(start)
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
    if (dates.length > 31) break // Safety guard: max 31 consecutive days
  }
  return dates
}

function formatDateFriendly(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const COMMON_OCCASIONS = [
  { label: '🪔 Diwali Festival', text: 'Diwali Festival - Kitchen Closed' },
  { label: '🌾 Pongal Festival', text: 'Pongal Harvest Festival - Kitchen Closed' },
  { label: '🎄 Christmas / New Year', text: 'New Year Holiday - Kitchen Closed' },
  { label: '🇮🇳 National Holiday', text: 'National Holiday - Service Closed' },
  { label: '🛠️ Kitchen Deep Cleaning', text: 'Scheduled Kitchen Maintenance & Deep Cleaning' },
  { label: '🌧️ Weather / Heavy Rain', text: 'Severe Weather Emergency Closure' },
]

export default function ServiceHolidays() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectionType, setSelectionType] = useState('single') // 'single' | 'range'
  const [singleDate, setSingleDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [startDate, setStartDate] = useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 10)
  })
  const [endDate, setEndDate] = useState(() => {
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    return dayAfter.toISOString().slice(0, 10)
  })
  const [reason, setReason] = useState('Diwali Festival - Kitchen Closed')
  const [formError, setFormError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'holidays', month],
    queryFn: () => listAdminServiceHolidays(month || undefined),
  })

  const addMutation = useMutation({
    mutationFn: addServiceHoliday,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'holidays'] })
      setModalOpen(false)
      setFormError(null)
      setActionNotice(
        `Holiday declared successfully. ${res.total_subscriptions_skipped ?? 0} active subscriptions were automatically skipped and ₹${Number(res.total_refund_amount ?? 0).toFixed(2)} in refunds credited.`
      )
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to register holiday')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteServiceHoliday,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'holidays'] })
      setActionNotice(
        `Service holiday for ${res.holiday_date} removed. ${res.subscriptions_resumed ?? 0} subscriber delivery dates restored.`
      )
    },
  })

  // Computed dates for preview and submission
  const computedDates = useMemo(() => {
    if (selectionType === 'single') {
      return singleDate ? [singleDate] : []
    }
    return getDatesInRange(startDate, endDate)
  }, [selectionType, singleDate, startDate, endDate])

  const openDeclareModal = () => {
    setFormError(null)
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    if (computedDates.length === 0) {
      setFormError('Please select a valid date or date range.')
      return
    }

    if (!reason.trim()) {
      setFormError('Please provide a reason or occasion for the holiday.')
      return
    }

    const payload = {
      reason: reason.trim(),
    }

    if (computedDates.length === 1) {
      payload.date = computedDates[0]
    } else {
      payload.dates = computedDates
    }

    addMutation.mutate(payload)
  }

  const handleDelete = (h) => {
    if (
      window.confirm(
        `Are you sure you want to remove the service holiday for ${h.holiday_date}? Scheduled deliveries for active subscribers will resume.`
      )
    ) {
      deleteMutation.mutate(h.holiday_date)
    }
  }

  const holidays = data?.holidays ?? []

  // Top summary KPIs
  const summaryKpis = useMemo(() => {
    const totalDays = holidays.length
    const totalSkipped = holidays.reduce((sum, h) => sum + (h.total_subscriptions_skipped || 0), 0)
    const totalRefunds = holidays.reduce((sum, h) => sum + (Number(h.total_refund_amount) || 0), 0)
    return { totalDays, totalSkipped, totalRefunds }
  }, [holidays])

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Service Holidays & Kitchen Closures"
          description="Schedule non-operational dates for festivals or maintenance. All subscriber deliveries are automatically skipped and refunded."
        />
        <Button onClick={openDeclareModal} className="shrink-0 shadow-sm">
          <Plus className="h-4 w-4" /> Declare Kitchen Closure
        </Button>
      </div>

      {actionNotice ? (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-forest-50 p-4 text-xs font-semibold text-forest-800 border border-forest-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-forest-600 hover:text-forest-900">
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Declared Closed Days</span>
            <CalendarX className="h-4 w-4 text-chili-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-ink-900">
            {summaryKpis.totalDays} {summaryKpis.totalDays === 1 ? 'day' : 'days'}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Kitchen non-operational dates</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Subscriptions Auto-Skipped</span>
            <Users className="h-4 w-4 text-forest-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-forest-700">
            {summaryKpis.totalSkipped}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Subscriber meals protected</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs font-medium text-ink-500">
            <span>Total Refunds Credited</span>
            <IndianRupee className="h-4 w-4 text-chili-600" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-chili-600">
            ₹{summaryKpis.totalRefunds.toFixed(2)}
          </p>
          <p className="text-[11px] text-ink-400 mt-0.5">Credited to customer balances</p>
        </Card>
      </div>

      {/* Month Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-month" className="text-xs font-medium text-ink-500">
            Filter by Month:
          </label>
          <input
            id="filter-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-cream-300 bg-white px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
          />
          {month ? (
            <button
              onClick={() => setMonth('')}
              className="text-xs font-semibold text-chili-500 hover:underline"
            >
              Show All Months
            </button>
          ) : null}
        </div>
        <p className="text-xs text-ink-400">Declared records: {holidays.length}</p>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-ink-300">Loading service holidays…</p>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-chili-500">
            Error loading holidays: {error?.message || 'Failed to fetch'}
          </p>
        ) : holidays.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarX className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-2 text-sm font-medium text-ink-900">No kitchen holidays declared</p>
            <p className="text-xs text-ink-400 mt-0.5">
              Deliveries will run on all standard operational days. Click "Declare Kitchen Closure" to schedule one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Closure Date</th>
                  <th className="py-3 px-4">Occasion / Reason</th>
                  <th className="py-3 px-4">Scheduled By</th>
                  <th className="py-3 px-4 text-center">Subscribers Skipped</th>
                  <th className="py-3 px-4 text-right">Refund Credited</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-ink-900 font-mono text-xs">
                        {h.holiday_date}
                      </p>
                      <p className="text-[11px] text-ink-400">
                        {formatDateFriendly(h.holiday_date)}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink-800">{h.reason}</td>
                    <td className="py-3 px-4 text-ink-500">{h.created_by_admin || 'Admin'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-pill bg-forest-50 border border-forest-200 px-2.5 py-0.5 font-bold text-forest-700">
                        {h.total_subscriptions_skipped} active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-forest-700">
                      ₹{Number(h.total_refund_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(h)}
                        disabled={deleteMutation.isLoading}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-chili-600 hover:bg-chili-50 disabled:opacity-50"
                        title="Resume Deliveries for this Date"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Resume Service
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Upgraded, Highly Understandable Kitchen Closure Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Declare Kitchen Closure / Service Holiday"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {formError ? (
            <div className="flex items-center gap-2 rounded-xl bg-chili-50 p-3 text-chili-600 border border-chili-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{formError}</span>
            </div>
          ) : null}

          {/* Step 1: Closure Duration Type Cards */}
          <div>
            <label className="block text-xs font-semibold text-ink-800 mb-1.5">
              1. How long will the kitchen be closed?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectionType('single')}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  selectionType === 'single'
                    ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chili-100 text-chili-600 font-bold">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Single Day Closure</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">Close kitchen for 1 specific date</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectionType('range')}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  selectionType === 'range'
                    ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Multi-Day Date Range</p>
                  <p className="text-[11px] text-ink-400 mt-0.5">2 or more consecutive days</p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Date Selector (NO raw textareas!) */}
          <div className="rounded-xl border border-cream-200 bg-cream-50/60 p-4">
            <label className="block text-xs font-semibold text-ink-800 mb-2">
              2. Select Date(s)
            </label>

            {selectionType === 'single' ? (
              <div>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  required
                  className="w-full sm:w-64 rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                />
                <p className="mt-2 text-xs font-medium text-chili-600">
                  📅 Selected: <strong>{formatDateFriendly(singleDate)}</strong>
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[11px] font-medium text-ink-500 mb-1">From Date:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                    />
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-ink-500 mb-1">To Date:</span>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-ink-800">
                    Total {computedDates.length} consecutive days selected:
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {computedDates.map((d) => (
                      <span
                        key={d}
                        className="rounded-pill bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-800 border border-cream-200 shadow-2xs"
                      >
                        {formatDateFriendly(d)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Quick Occasion Presets & Reason */}
          <div>
            <label className="block text-xs font-semibold text-ink-800 mb-1.5">
              3. Reason or Occasion
            </label>

            {/* Quick 1-click preset buttons */}
            <div className="mb-2.5">
              <span className="text-[11px] text-ink-400 font-medium">Click a quick template:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {COMMON_OCCASIONS.map((occ) => (
                  <button
                    key={occ.label}
                    type="button"
                    onClick={() => setReason(occ.text)}
                    className="rounded-pill bg-cream-100 hover:bg-chili-50 hover:text-chili-600 hover:border-chili-300 border border-cream-200 px-3 py-1 text-[11px] font-medium text-ink-800 transition-colors"
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="e.g. Diwali Festival - Kitchen Closed"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full rounded-xl border border-cream-300 px-3.5 py-2.5 text-sm text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
            />
            <p className="mt-1 text-[11px] text-ink-400">
              This message will be shown to customers on their order tracking and subscription schedule.
            </p>
          </div>

          {/* Step 4: Visual Live Notice Preview & Impact explanation */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>What happens when you confirm this closure?</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-ink-700 leading-relaxed text-[11px] pl-1">
              <li>
                <strong>Automated Subscriber Skips:</strong> All customers with active subscriptions scheduled for these dates are automatically skipped.
              </li>
              <li>
                <strong>Instant Daily Meal Refund:</strong> Each subscriber receives a full credit refund for that day directly to their balance.
              </li>
              <li>
                <strong>Kitchen Dispatch Cleared:</strong> Daily kitchen prep batches for these dates will show 0 packs.
              </li>
            </ul>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-cream-200">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addMutation.isLoading}
              className="shadow-sm px-6"
            >
              <CheckCircle2 className="h-4 w-4" /> Confirm & Close Kitchen ({computedDates.length} {computedDates.length === 1 ? 'day' : 'days'})
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}
