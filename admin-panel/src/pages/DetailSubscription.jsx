import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Edit, ArrowUp, ArrowDown, Trash2 } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getSubscriptionPlanDetails, updateSubscriptionPlan } from '../api/subscriptions'
import { listProducts } from '../api/products'
import { useCursorList } from '../hooks/useCursorList'
import { getApiErrorMessage } from '../api/client'

const CATEGORY_OPTIONS = [
  'VEG',
  'NON_VEG',
]

export default function DetailSubscription() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editModalOpen, setEditModalOpen] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscription-plan', planId],
    queryFn: () => getSubscriptionPlanDetails(planId),
  })

  const productsQuery = useCursorList({
    queryKey: ['products'],
    queryFn: listProducts,
    itemsKey: 'products',
  })

  const plan = data?.plan
  const products = data?.products || []

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['subscription-plan', planId] })
    queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-center text-ink-300">Loading…</p>
      </DashboardShell>
    )
  }

  if (isError || !plan) {
    return (
      <DashboardShell>
        <p className="text-center text-chili-500">Couldn't load this plan.</p>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <button
        onClick={() => navigate('/subscriptions')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to subscriptions
      </button>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-xl font-semibold text-ink-900">{plan.name}</h1>
              <Badge tone={toneForStatus(plan.status)}>{formatStatusLabel(plan.status)}</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {plan.category} · ₹{plan.price_per_week.toFixed(0)} / week
            </p>
            {plan.description ? (
              <p className="mt-2 text-sm text-ink-500">{plan.description}</p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">
              Salads in rotation ({products.length})
            </h2>
            {products.length > 0 ? (
              <div className="mt-3 space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <ProductImage
                      src={product.image_url}
                      alt={product.name}
                      className="h-16 w-16 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-300">
                        Delivery #{product.delivery_order}
                      </p>
                      <p className="font-display text-base font-semibold text-ink-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-ink-500">
                        {product.quantity} {product.unit}
                      </p>
                      <p className="mt-1 text-xs text-ink-300">
                        {product.nutrition.calories} kcal · {product.nutrition.protein}g protein ·{' '}
                        {product.nutrition.carbs}g carbs · {product.nutrition.fat}g fat ·{' '}
                        {product.nutrition.fiber}g fiber
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-300">No salads linked to this plan.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Actions</h2>
            <p className="mt-1 text-xs text-ink-500">
              Update plan pricing, description, category, or rotate salads.
            </p>
            <Button
              onClick={() => setEditModalOpen(true)}
              className="mt-4 flex w-full items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" /> Edit Plan
            </Button>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-500">Plan ID</span>
                <span className="font-medium text-ink-900">#{plan.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Price / Week</span>
                <span className="font-medium text-ink-900">₹{plan.price_per_week}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Category</span>
                <span className="font-medium text-ink-900">{plan.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Status</span>
                <Badge tone={toneForStatus(plan.status)}>{formatStatusLabel(plan.status)}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <EditPlanModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        plan={plan}
        initialProducts={products}
        productsQuery={productsQuery}
        onUpdated={refresh}
      />
    </DashboardShell>
  )
}

function EditPlanModal({ open, onClose, plan, initialProducts, productsQuery, onUpdated }) {
  const [form, setForm] = useState({
    name: plan.name || '',
    category: plan.category || 'VEG',
    price_per_week: String(plan.price_per_week || ''),
    description: plan.description || '',
    status: plan.status || 'ACTIVE',
  })
  const [selectedProductIds, setSelectedProductIds] = useState(
    initialProducts.map((p) => String(p.id))
  )
  const [nextProductToAdd, setNextProductToAdd] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const productById = (id) =>
    initialProducts.find((p) => String(p.id) === String(id)) ||
    productsQuery.items.find((p) => String(p.id) === String(id))

  const addProduct = () => {
    if (!nextProductToAdd) return
    if (selectedProductIds.includes(nextProductToAdd)) {
      setNextProductToAdd('')
      return
    }
    setSelectedProductIds((prev) => [...prev, nextProductToAdd])
    setNextProductToAdd('')
  }

  const removeProduct = (id) => {
    setSelectedProductIds((prev) => prev.filter((p) => p !== id))
  }

  const moveProduct = (index, direction) => {
    setSelectedProductIds((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return next
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (selectedProductIds.length === 0) {
      setError('Add at least one salad to this plan.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateSubscriptionPlan({
        id: plan.id,
        name: form.name,
        category: form.category,
        pricePerWeek: Number(form.price_per_week),
        description: form.description,
        status: form.status,
        products: selectedProductIds.map((id, index) => ({
          product_id: Number(id),
          delivery_order: index + 1,
        })),
        image: imageFile || undefined,
      })

      if (result.success) {
        onUpdated()
        onClose()
      } else {
        setError(result.message || 'Could not update plan')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableProducts = productsQuery.items.filter(
    (p) => !selectedProductIds.includes(String(p.id))
  )

  return (
    <Modal open={open} onClose={onClose} title="Edit subscription plan" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Plan name" value={form.name} onChange={update('name')} required />

        <div className="grid grid-cols-2 gap-4">
          <Field as="select" label="Category" value={form.category} onChange={update('category')}>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ')}
              </option>
            ))}
          </Field>
          <Field
            label="Price / week (₹)"
            type="number"
            step="1"
            value={form.price_per_week}
            onChange={update('price_per_week')}
            required
          />
        </div>

        <Field as="select" label="Status" value={form.status} onChange={update('status')}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </Field>

        <Field
          as="textarea"
          rows={3}
          label="Description"
          value={form.description}
          onChange={update('description')}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Replace Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-ink-700 file:mr-4 file:rounded-xl file:border-0 file:bg-cream-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-700 hover:file:bg-cream-200"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Salads in rotation (in order)
          </label>

          {selectedProductIds.length > 0 ? (
            <ul className="mb-2 space-y-1.5">
              {selectedProductIds.map((id, index) => {
                const product = productById(id)
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-ink-900">
                      #{index + 1} {product?.name || `Product #${id}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveProduct(index, -1)}
                        disabled={index === 0}
                        className="rounded p-1 text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                        title="Move earlier"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProduct(index, 1)}
                        disabled={index === selectedProductIds.length - 1}
                        className="rounded p-1 text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                        title="Move later"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(id)}
                        className="rounded p-1 text-chili-500 hover:bg-chili-50"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mb-2 text-xs text-ink-300">No salads selected yet.</p>
          )}

          {availableProducts.length > 0 ? (
            <div className="flex gap-2">
              <select
                value={nextProductToAdd}
                onChange={(e) => setNextProductToAdd(e.target.value)}
                className="flex-1 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm outline-none focus:border-chili-400"
              >
                <option value="">Add a salad…</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button type="button" variant="ghost" onClick={addProduct} disabled={!nextProductToAdd}>
                Add
              </Button>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <div className="flex justify-end gap-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  )
}