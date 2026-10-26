import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ticket, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import { listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../api/coupons'

const initialForm = {
  code: '',
  description: '',
  discount_type: 'PERCENTAGE',
  discount_value: '',
  min_order_amount: '0',
  max_discount_amount: '',
  start_date: '',
  end_date: '',
  usage_limit: '',
  status: 'ACTIVE',
}

export default function Coupons() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: listCoupons,
  })

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      closeModal()
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to create coupon')
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      closeMutationModal()
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || err.message || 'Failed to update coupon')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
    },
  })

  const openCreateModal = () => {
    setEditingCoupon(null)
    setForm(initialForm)
    setFormError(null)
    setModalOpen(true)
  }

  const openEditModal = (c) => {
    setEditingCoupon(c)
    setForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount || '0',
      max_discount_amount: c.max_discount_amount || '',
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      usage_limit: c.usage_limit || '',
      status: c.status,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCoupon(null)
    setFormError(null)
  }

  const closeMutationModal = () => {
    closeModal()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount || 0),
      max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      usage_limit: form.usage_limit ? parseInt(form.usage_limit, 10) : null,
      status: form.status,
    }

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (c) => {
    if (window.confirm(`Are you sure you want to delete coupon code "${c.code}"?`)) {
      deleteMutation.mutate(c.id)
    }
  }

  const coupons = data?.coupons ?? []

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Promo Codes & Coupons"
          description="Create percentage or fixed discounts, set usage limits, and manage promotions."
        />
        <Button onClick={openCreateModal} className="shrink-0">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-ink-300">Loading coupons…</p>
        ) : isError ? (
          <p className="py-12 text-center text-sm text-chili-500">
            Error loading coupons: {error?.message || 'Failed to fetch'}
          </p>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-2 text-sm font-medium text-ink-900">No promo codes yet</p>
            <p className="text-xs text-ink-400">Click "Create Coupon" above to add your first promotion.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Order / Cap</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Usage Limit</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 text-xs">
                {coupons.map((c) => {
                  const isPercentage = c.discount_type === 'PERCENTAGE'
                  const statusTone = c.status === 'ACTIVE' ? 'forest' : 'neutral'
                  return (
                    <tr key={c.id} className="hover:bg-cream-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold tracking-wider text-chili-600 bg-chili-50 px-2 py-0.5 rounded-lg border border-chili-200">
                            {c.code}
                          </span>
                        </div>
                        {c.description ? (
                          <p className="text-[11px] text-ink-400 mt-1 max-w-xs">{c.description}</p>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink-900">
                        {isPercentage ? `${Number(c.discount_value)}% OFF` : `₹${Number(c.discount_value)} OFF`}
                      </td>
                      <td className="py-3 px-4 text-ink-600">
                        <p>Min: ₹{Number(c.min_order_amount || 0).toFixed(0)}</p>
                        {c.max_discount_amount ? (
                          <p className="text-ink-400 text-[11px]">Cap: ₹{Number(c.max_discount_amount).toFixed(0)}</p>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 text-ink-600">
                        {c.start_date || c.end_date ? (
                          <>
                            <p>{c.start_date || 'Anytime'}</p>
                            <p className="text-ink-400 text-[11px]">to {c.end_date || 'No expiry'}</p>
                          </>
                        ) : (
                          <span className="text-ink-400">Always valid</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-ink-800">
                          {c.used_count ?? 0}
                        </span>
                        <span className="text-ink-400"> / {c.usage_limit ? c.usage_limit : '∞'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge tone={statusTone}>{c.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-ink-500 hover:text-ink-900 hover:bg-cream-200 rounded-lg"
                            title="Edit Coupon"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={deleteMutation.isLoading}
                            className="p-1.5 text-ink-500 hover:text-chili-600 hover:bg-chili-50 rounded-lg disabled:opacity-50"
                            title="Delete Coupon"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create / Edit Coupon Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Code'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError ? (
            <div className="flex items-center gap-2 rounded-xl bg-chili-50 p-3 text-chili-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          ) : null}

          <Field label="Coupon Code" required>
            <input
              type="text"
              placeholder="e.g. FESTIVE15"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              className="w-full rounded-xl border border-cream-300 px-3 py-2 uppercase font-mono font-bold text-ink-900 outline-none focus:border-chili-400"
            />
          </Field>

          <Field label="Description">
            <input
              type="text"
              placeholder="e.g. 15% discount for Diwali orders"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Discount Type" required>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 font-medium text-ink-900 outline-none focus:border-chili-400"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </Field>

            <Field
              label={form.discount_type === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (₹)'}
              required
            >
              <input
                type="number"
                step="any"
                min="0.01"
                max={form.discount_type === 'PERCENTAGE' ? '100' : undefined}
                placeholder="e.g. 10"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                required
                className="w-full rounded-xl border border-cream-300 px-3 py-2 font-medium text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Min Order Amount (₹)">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>

            <Field label="Max Discount Cap (₹)">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Optional max cap"
                value={form.max_discount_amount}
                onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valid From">
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>

            <Field label="Valid Until">
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Total Usage Limit">
              <input
                type="number"
                min="1"
                placeholder="Unlimited"
                value={form.usage_limit}
                onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
              />
            </Field>

            <Field label="Status" required>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 font-medium text-ink-900 outline-none focus:border-chili-400"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-cream-200">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading || updateMutation.isLoading}
            >
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}
