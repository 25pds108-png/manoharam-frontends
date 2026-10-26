import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Percent,
  IndianRupee,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
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

// Sensible presets that give admins instant 1-click templates
const PRESETS = [
  {
    label: '🎉 10% Off (Cap ₹100)',
    code: 'SAVE10',
    description: '10% discount up to ₹100 on orders over ₹200',
    discount_type: 'PERCENTAGE',
    discount_value: '10',
    min_order_amount: '200',
    max_discount_amount: '100',
  },
  {
    label: '✨ 15% Festive Deal',
    code: 'FESTIVE15',
    description: '15% festive discount up to ₹150 on orders over ₹300',
    discount_type: 'PERCENTAGE',
    discount_value: '15',
    min_order_amount: '300',
    max_discount_amount: '150',
  },
  {
    label: '🏷️ Flat ₹50 Off',
    code: 'FLAT50',
    description: 'Flat ₹50 discount on orders over ₹299',
    discount_type: 'FIXED',
    discount_value: '50',
    min_order_amount: '299',
    max_discount_amount: '',
  },
  {
    label: '🚚 Free Shipping / ₹30 Off',
    code: 'FREESHIP',
    description: 'Flat ₹30 shipping discount on orders over ₹199',
    discount_type: 'FIXED',
    discount_value: '30',
    min_order_amount: '199',
    max_discount_amount: '',
  },
]

export default function Coupons() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [formError, setFormError] = useState(null)
  const [activeStep, setActiveStep] = useState('offer') // 'offer' | 'rules' | 'dates'

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
      closeModal()
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
    setActiveStep('offer')
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
    setActiveStep('offer')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingCoupon(null)
    setFormError(null)
  }

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      code: preset.code,
      description: preset.description,
      discount_type: preset.discount_type,
      discount_value: preset.discount_value,
      min_order_amount: preset.min_order_amount,
      max_discount_amount: preset.max_discount_amount,
    }))
  }

  const generateRandomCode = () => {
    const prefixes = ['SAVE', 'FESTIVE', 'MANO', 'SPECIAL', 'DEAL']
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(10 + Math.random() * 90)
    setForm((prev) => ({ ...prev, code: `${randomPrefix}${randomNum}` }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    if (!form.code.trim()) {
      setFormError('Please enter a coupon code.')
      setActiveStep('offer')
      return
    }

    const val = parseFloat(form.discount_value)
    if (!val || val <= 0) {
      setFormError('Please enter a valid discount value greater than 0.')
      setActiveStep('offer')
      return
    }

    if (form.discount_type === 'PERCENTAGE' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.')
      setActiveStep('offer')
      return
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discount_type: form.discount_type,
      discount_value: val,
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

  // Simulation calculation for the live preview card
  const previewSimulation = useMemo(() => {
    const sampleCart = 500
    const val = parseFloat(form.discount_value) || 0
    let discount = 0
    if (form.discount_type === 'PERCENTAGE') {
      discount = (sampleCart * val) / 100
      if (form.max_discount_amount) {
        const cap = parseFloat(form.max_discount_amount)
        if (discount > cap) discount = cap
      }
    } else {
      discount = val
    }
    const finalPrice = Math.max(0, sampleCart - discount)
    return { sampleCart, discount, finalPrice }
  }, [form.discount_type, form.discount_value, form.max_discount_amount])

  const coupons = data?.coupons ?? []

  return (
    <DashboardShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          title="Promo Codes & Coupons"
          description="Create attractive discounts, set spending requirements, and boost customer orders."
        />
        <Button onClick={openCreateModal} className="shrink-0 shadow-sm">
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
            <p className="mt-2 text-sm font-medium text-ink-900">No promo codes active</p>
            <p className="text-xs text-ink-400">Click "Create Coupon" above to set up your first customer discount.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cream-200 bg-cream-50/50 text-xs font-semibold uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Spend / Max Cap</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Redemptions</th>
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
                          <p className="text-[11px] text-ink-400 mt-1 max-w-xs truncate">{c.description}</p>
                        ) : null}
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink-900">
                        {isPercentage ? `${Number(c.discount_value)}% OFF` : `₹${Number(c.discount_value)} OFF`}
                      </td>
                      <td className="py-3 px-4 text-ink-600">
                        <p>Min order: ₹{Number(c.min_order_amount || 0).toFixed(0)}</p>
                        {c.max_discount_amount ? (
                          <p className="text-ink-400 text-[11px]">Max discount: ₹{Number(c.max_discount_amount).toFixed(0)}</p>
                        ) : (
                          <p className="text-ink-300 text-[11px]">No max cap</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-ink-600">
                        {c.start_date || c.end_date ? (
                          <>
                            <p>{c.start_date || 'Started'}</p>
                            <p className="text-ink-400 text-[11px]">until {c.end_date || 'No expiry'}</p>
                          </>
                        ) : (
                          <span className="text-ink-400">Always active</span>
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

      {/* Upgraded, User-Friendly Create / Edit Coupon Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {formError ? (
            <div className="flex items-center gap-2 rounded-xl bg-chili-50 p-3 text-chili-600 border border-chili-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="font-medium">{formError}</span>
            </div>
          ) : null}

          {/* Quick Presets (Only when creating new coupon) */}
          {!editingCoupon ? (
            <div className="rounded-xl bg-cream-50/80 p-3.5 border border-cream-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-chili-500" />
                <span>Quick Templates (Click to fill instantly):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-pill bg-white px-3 py-1 text-xs font-medium text-ink-800 border border-cream-300 hover:border-chili-400 hover:bg-chili-50/50 hover:text-chili-600 transition-colors shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Interactive Live Coupon Ticket Preview */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-chili-500 via-chili-600 to-amber-600 p-4 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs font-bold text-lg">
                  {form.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                    Live Customer Preview
                  </p>
                  <p className="font-display text-xl font-bold tracking-tight">
                    {form.discount_value
                      ? form.discount_type === 'PERCENTAGE'
                        ? `${form.discount_value}% OFF`
                        : `₹${form.discount_value} FLAT OFF`
                      : 'Special Discount'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-white px-3 py-1 font-mono text-sm font-bold tracking-wider text-ink-900 shadow-sm border border-cream-200">
                  {form.code.trim() || 'PROMOCODE'}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-white/90">
              <p>
                {Number(form.min_order_amount) > 0
                  ? `Min order: ₹${Number(form.min_order_amount).toFixed(0)}`
                  : 'No minimum order required'}
                {form.discount_type === 'PERCENTAGE' && form.max_discount_amount
                  ? ` · Max discount: ₹${Number(form.max_discount_amount).toFixed(0)}`
                  : ''}
              </p>
              {form.discount_value ? (
                <p className="text-[11px] bg-black/20 px-2 py-0.5 rounded-md font-medium text-cream-100">
                  Example: On ₹{previewSimulation.sampleCart} order → Saves ₹
                  {previewSimulation.discount.toFixed(0)}, pays ₹
                  {previewSimulation.finalPrice.toFixed(0)}
                </p>
              ) : null}
            </div>
          </div>

          {/* Step Navigation Tabs */}
          <div className="flex border-b border-cream-200 gap-6">
            <button
              type="button"
              onClick={() => setActiveStep('offer')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeStep === 'offer'
                  ? 'border-chili-500 text-chili-600'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              <Ticket className="h-3.5 w-3.5" /> 1. The Offer
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('rules')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeStep === 'rules'
                  ? 'border-chili-500 text-chili-600'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> 2. Order Rules (Optional)
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('dates')}
              className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeStep === 'dates'
                  ? 'border-chili-500 text-chili-600'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" /> 3. Schedule & Status
            </button>
          </div>

          {/* TAB 1: THE OFFER */}
          {activeStep === 'offer' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">
                  1. Coupon Code <span className="text-chili-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE15"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    required
                    className="flex-1 rounded-xl border border-cream-300 px-3.5 py-2.5 font-mono text-sm font-bold uppercase text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-cream-100 flex items-center gap-1 shadow-2xs"
                    title="Generate Random Code"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-chili-500" />
                    <span>Generate</span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-ink-400">
                  This is what customers type at checkout. Use simple words like <strong>SAVE10</strong> or <strong>MANOHARAM</strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1.5">
                  2. Choose Discount Type <span className="text-chili-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discount_type: 'PERCENTAGE' })}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      form.discount_type === 'PERCENTAGE'
                        ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                        : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chili-100 text-chili-600 font-bold">
                      <Percent className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">Percentage Off (%)</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">e.g. 10% or 20% off whole cart</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, discount_type: 'FIXED' })}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      form.discount_type === 'FIXED'
                        ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                        : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-700 font-bold">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-900">Flat Amount Off (₹)</p>
                      <p className="text-[11px] text-ink-400 mt-0.5">e.g. Flat ₹50 or ₹100 discount</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">
                  3. Discount Value <span className="text-chili-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-bold">
                    {form.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    max={form.discount_type === 'PERCENTAGE' ? '100' : undefined}
                    placeholder={form.discount_type === 'PERCENTAGE' ? '15' : '50'}
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    required
                    className="w-full rounded-xl border border-cream-300 pl-8 pr-3 py-2.5 font-bold text-sm text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
                  />
                </div>
                <p className="mt-1 text-[11px] text-ink-400">
                  {form.discount_type === 'PERCENTAGE'
                    ? 'Percentage deducted from order (max 100%).'
                    : 'Fixed rupee amount deducted from total order.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-800 mb-1">
                  4. Description for Customers (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15% discount for Diwali festive orders"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-cream-300 px-3 py-2 text-ink-900 outline-none focus:border-chili-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('rules')}
                  className="rounded-pill bg-cream-200 px-4 py-2 font-semibold text-ink-800 hover:bg-cream-300"
                >
                  Next: Set Order Rules →
                </button>
              </div>
            </div>
          ) : null}

          {/* TAB 2: RULES & LIMITS */}
          {activeStep === 'rules' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <div className="flex items-center gap-1.5 font-semibold text-ink-800 mb-1">
                    <span>Minimum Order Requirement</span>
                    <HelpCircle className="h-3.5 w-3.5 text-ink-400" />
                  </div>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={form.min_order_amount}
                      onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">
                    Customers must spend at least this amount to apply the coupon. Leave as <strong>0</strong> for no minimum spend.
                  </p>
                </div>

                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <div className="flex items-center gap-1.5 font-semibold text-ink-800 mb-1">
                    <span>Maximum Discount Cap (₹)</span>
                    <HelpCircle className="h-3.5 w-3.5 text-ink-400" />
                  </div>
                  <div className="relative mt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 font-bold">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      disabled={form.discount_type === 'FIXED'}
                      placeholder={form.discount_type === 'FIXED' ? 'Not applicable for flat amount' : 'No limit (optional)'}
                      value={form.max_discount_amount}
                      onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                      className="w-full rounded-xl border border-cream-300 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400 disabled:bg-cream-100 disabled:opacity-50"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-400">
                    {form.discount_type === 'PERCENTAGE'
                      ? 'Protects you from huge discounts on large orders (e.g. 20% off up to ₹100 max).'
                      : 'Disabled for flat amounts (the flat amount is already the exact discount).'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4 max-w-sm">
                <label className="block font-semibold text-ink-800 mb-1">
                  Total Redemption Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited uses"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-chili-400"
                />
                <p className="mt-1 text-[11px] text-ink-400">
                  Total times this coupon can be used across all customers (e.g. first 50 customers). Leave blank for unlimited uses.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('offer')}
                  className="rounded-pill bg-cream-100 px-4 py-2 font-semibold text-ink-600 hover:bg-cream-200"
                >
                  ← Back: Offer Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('dates')}
                  className="rounded-pill bg-cream-200 px-4 py-2 font-semibold text-ink-800 hover:bg-cream-300"
                >
                  Next: Schedule & Dates →
                </button>
              </div>
            </div>
          ) : null}

          {/* TAB 3: DATES & STATUS */}
          {activeStep === 'dates' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <label className="block font-semibold text-ink-800 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-chili-400"
                  />
                  <p className="mt-1 text-[11px] text-ink-400">
                    Coupon will be valid starting from this date. Leave empty to activate immediately.
                  </p>
                </div>

                <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4">
                  <label className="block font-semibold text-ink-800 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-chili-400"
                  />
                  <p className="mt-1 text-[11px] text-ink-400">
                    Coupon automatically expires after this date. Leave empty for no expiry.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-4 max-w-sm">
                <label className="block font-semibold text-ink-800 mb-1">
                  Coupon Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm font-semibold text-ink-900 outline-none focus:border-chili-400"
                >
                  <option value="ACTIVE">ACTIVE (Customers can use immediately)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily paused / hidden)</option>
                </select>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('rules')}
                  className="rounded-pill bg-cream-100 px-4 py-2 font-semibold text-ink-600 hover:bg-cream-200"
                >
                  ← Back: Order Rules
                </button>
              </div>
            </div>
          ) : null}

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-cream-200">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                loading={createMutation.isLoading || updateMutation.isLoading}
                className="shadow-sm px-6"
              >
                <CheckCircle2 className="h-4 w-4" />
                {editingCoupon ? 'Save Changes' : 'Create & Activate Coupon'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  )
}
