import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarX, Plus, Trash2, AlertCircle, Info, CheckCircle2 } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import {
  listAdminServiceHolidays,
  addServiceHoliday,
  deleteServiceHoliday,
} from '../api/holidays'

export default function ServiceHolidays() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    date: '',
    datesInput: '',
    isMultiple: false,
    reason: '',
  })
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
      setForm({ date: '', datesInput: '', isMultiple: false, reason: '' })
      setFormError(null)
      setActionNotice(
        `Holiday registered. Affected subscriptions: ${res.total_subscriptions_skipped ?? 0}, Total refund credited: ₹${Number(res.total_refund_amount ?? 0).toFixed(2)}`
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
        `Service resumed for ${res.holiday_date}. ${res.subscriptions_resumed ?? 0} subscription delivery days restored.`
      )
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    let payload = { reason: form.reason.trim() || 'Service holiday - Kitchen closed' }
    if (form.isMultiple) {
      const dates = form.datesInput
        .split('\n')
        .map((d) => d.trim())
        .filter(Boolean)
      if (dates.length === 0) {
        setFormError('Please enter at least one date.')
        return
      }
      payload.dates = dates
    } else {
      if (!form.date) {
        setFormError('Please pick a holiday date.')
        return
      }
      payload.date = form.date
    }

    addMutation.mutate(payload)
  }

  const handleDelete = (h) => {
    if (
      window.confirm(
        `Are you sure you want to remove service holiday for ${h.holiday_date}? Future customer subscriptions scheduled for this day will resume deliveries.`
      )
    ) {
      deleteMutation.mutate(h.holiday_date)
    }
  }

  const holidays = data?.holidays ?? []

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Service Holidays & Kitchen Closures"
          description="Declare non-operational festival or maintenance days. All active subscribers are automatically skipped and refunded."
        />
        <Button onClick={() => setModalOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Declare Service Holiday
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
            className="rounded-xl border border-cream-300 bg-white px-3 py-1.5 text-xs text-ink-900 outline-none focus:border-chili-400"
          />
          {month ? (
            <button
              onClick={() => setMonth('')}
              className="text-xs font-semibold text-chili-500 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>
        <p className="text-xs text-ink-400">Total declared: {holidays.length} days</p>
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
            <p className="mt-2 text-sm font-medium text-ink-900">No holidays declared</p>
            <p className="text-xs text-ink-400">
              Deliveries will run on all standard operational days.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Holiday Date</th>
                  <th className="py-3 px-4">Reason / Occasion</th>
                  <th className="py-3 px-4">Declared By</th>
                  <th className="py-3 px-4 text-center">Subscriptions Skipped</th>
                  <th className="py-3 px-4 text-right">Total Refund Credited</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {holidays.map((h) => (
                  <tr key={h.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink-900 font-mono">
                      {h.holiday_date}
                    </td>
                    <td className="py-3 px-4 text-ink-800 font-medium">{h.reason}</td>
                    <td className="py-3 px-4 text-ink-500">{h.created_by_admin || 'Admin'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center rounded-pill bg-cream-200 px-2.5 py-0.5 font-bold text-ink-800">
                        {h.total_subscriptions_skipped}
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
                        title="Resume Deliveries"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Declare Service Holiday Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Declare Service Holiday"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="rounded-xl bg-cream-100/70 p-3 text-ink-600 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-ink-400 mt-0.5" />
            <p className="leading-relaxed">
              When declared, all active customer subscriptions scheduled for these dates are
              automatically recorded as holiday skips and refunded to customer balances.
            </p>
          </div>

          {formError ? (
            <div className="flex items-center gap-2 rounded-xl bg-chili-50 p-3 text-chili-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-ink-900">
              <input
                type="radio"
                name="holidayMode"
                checked={!form.isMultiple}
                onChange={() => setForm({ ...form, isMultiple: false })}
                className="text-chili-500"
              />
              Single Date
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-ink-900">
              <input
                type="radio"
                name="holidayMode"
                checked={form.isMultiple}
                onChange={() => setForm({ ...form, isMultiple: true })}
                className="text-chili-500"
              />
              Multiple Consecutive Dates
            </label>
          </div>

          {!form.isMultiple ? (
            <Field label="Holiday Date" required>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>
          ) : (
            <Field label="Holiday Dates (one date per line: YYYY-MM-DD)" required>
              <textarea
                rows={4}
                placeholder="2026-11-14&#10;2026-11-15"
                value={form.datesInput}
                onChange={(e) => setForm({ ...form, datesInput: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 font-mono text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>
          )}

          <Field label="Reason / Occasion" required>
            <input
              type="text"
              placeholder="e.g. Diwali Festival - Kitchen Closed"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-3 border-t border-cream-200">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={addMutation.isLoading}>
              Declare Holiday
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}
