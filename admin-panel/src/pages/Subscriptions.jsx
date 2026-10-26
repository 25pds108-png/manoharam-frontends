import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Sparkles } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import { useCursorList } from '../hooks/useCursorList'
import { listSubscriptions, listSubscriptionPlans, createSubscriptionPlan } from '../api/subscriptions'
import { listProducts } from '../api/products'
import { getApiErrorMessage } from '../api/client'

const TABS = [
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'plans', label: 'Plans', icon: Sparkles },
]

const emptyPlanForm = {
  name: '',
  category: 'VEG',
  price_per_week: '',
  description: '',
  status: 'ACTIVE',
}

export default function Subscriptions() {
  const [activeTab, setActiveTab] = useState('subscribers')
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const subscriptionsQuery = useCursorList({
    queryKey: ['subscriptions'],
    queryFn: listSubscriptions,
    itemsKey: 'subscriptions',
  })

  const plansQuery = useCursorList({
    queryKey: ['subscription-plans'],
    queryFn: listSubscriptionPlans,
    itemsKey: 'plans',
  })

  const productsQuery = useCursorList({
    queryKey: ['products'],
    queryFn: listProducts,
    itemsKey: 'products',
  })

  return (
    <DashboardShell>
      <PageHeader
        title="Subscriptions"
        description="Salad subscriptions — manage which salads are subscribable, and review customer sign-ups."
        action={
          <Button onClick={() => setPlanModalOpen(true)}>
            <Plus className="h-4 w-4" /> New plan
          </Button>
        }
      />

      <div className="mb-5 flex w-fit gap-1 rounded-pill bg-white p-1 shadow-sm shadow-ink-900/5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-chili-500 text-cream-50' : 'text-ink-700 hover:bg-cream-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'subscribers' ? (
        <SubscribersTab query={subscriptionsQuery} />
      ) : (
        <PlansTab query={plansQuery} />
      )}

      <CreatePlanModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        productsQuery={productsQuery}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
          setActiveTab('plans')
        }}
      />
    </DashboardShell>
  )
}

function SubscribersTab({ query }) {
  const { items: subscriptions, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    query

  return (
    <>
      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-200 text-ink-500">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Salad</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-cream-50">
                <td className="px-5 py-3">
                  <p className="font-medium text-ink-900">{sub.customer_name}</p>
                  <p className="text-xs text-ink-300">{sub.phone}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-ink-900">{sub.product_name || sub.plan_name}</p>
                  <p className="text-xs text-ink-300">{sub.plan_name}</p>
                </td>
                <td className="px-5 py-3 text-ink-700">
                  {sub.start_date} – {sub.end_date}
                </td>
                <td className="px-5 py-3">
                  <Badge tone={toneForStatus(sub.status)}>{formatStatusLabel(sub.status)}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/subscriptions/${sub.id}`} className="text-sm font-medium text-chili-500">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading ? <p className="p-6 text-center text-ink-300">Loading…</p> : null}
        {isError ? (
          <p className="p-6 text-center text-chili-500">Couldn't load subscriptions.</p>
        ) : null}
        {!isLoading && subscriptions.length === 0 ? (
          <p className="p-6 text-center text-ink-300">No subscribers yet.</p>
        ) : null}
      </Card>

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function PlansTab({ query }) {
  const { items: plans, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = query

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const products = plan.products || []
          return (
            <Link key={plan.id} to={`/subscriptions/plans/${plan.id}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-md hover:shadow-ink-900/10">
                <ProductImage
                  src={plan.image_url || products[0]?.image_url}
                  alt={products[0]?.name || plan.name}
                  className="h-32 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink-900">
                        {plan.name}
                      </h3>
                      {plan.category ? (
                        <span className="mt-0.5 inline-block text-xs font-semibold uppercase tracking-wider text-ink-400">
                          {plan.category}
                        </span>
                      ) : null}
                    </div>
                    <Badge tone={toneForStatus(plan.status)}>{formatStatusLabel(plan.status)}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {products.length > 0
                      ? products.map((p) => p.name).join(' → ')
                      : 'No salads linked to this plan'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="font-display text-lg font-semibold text-chili-500">
                      ₹{Number(plan.price_per_week).toFixed(0)}
                      <span className="ml-1 text-xs font-normal text-ink-300">/ week</span>
                    </p>
                    <p className="text-xs text-ink-300">
                      {products.length} salad{products.length === 1 ? '' : 's'} in rotation
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {isLoading ? <p className="py-10 text-center text-ink-300">Loading…</p> : null}
      {isError ? <p className="py-10 text-center text-chili-500">Couldn't load plans.</p> : null}
      {!isLoading && plans.length === 0 ? (
        <Card className="p-10 text-center text-ink-300">
          No subscription plans yet — create one to let customers subscribe to a salad.
        </Card>
      ) : null}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  )
}

function CreatePlanModal({ open, onClose, onCreated, productsQuery }) {
  const [form, setForm] = useState(emptyPlanForm)
  // Ordered list of product ids — array order IS the delivery order,
  // matching subscription_plan_products.delivery_order on the backend.
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [nextProductToAdd, setNextProductToAdd] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const productById = (id) => productsQuery.items.find((p) => String(p.id) === String(id))

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

  const resetAndClose = () => {
    setForm(emptyPlanForm)
    setSelectedProductIds([])
    setNextProductToAdd('')
    setImageFile(null)
    setError(null)
    onClose()
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
      const data = await createSubscriptionPlan({
        products: selectedProductIds.map((id, index) => ({
          product_id: Number(id),
          delivery_order: index + 1,
        })),
        name: form.name,
        category: form.category || 'VEG',
        price_per_week: Number(form.price_per_week),
        description: form.description,
        status: form.status,
        image: imageFile || undefined,
      })
      if (data.success) {
        onCreated()
        resetAndClose()
      } else {
        setError(data.message || 'Could not create plan')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableProducts = productsQuery.items.filter(
    (p) => !selectedProductIds.includes(String(p.id))
  )

  return (
    <Modal open={open} onClose={resetAndClose} title="New subscription plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Salads in this plan
          </label>

          {selectedProductIds.length > 0 ? (
            <ul className="mb-2 space-y-1.5">
              {selectedProductIds.map((id, index) => {
                const product = productById(id)
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm"
                  >
                    <span className="text-ink-900">
                      {index + 1}. {product?.name || `Product #${id}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveProduct(index, -1)}
                        disabled={index === 0}
                        className="rounded px-1.5 py-0.5 text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveProduct(index, 1)}
                        disabled={index === selectedProductIds.length - 1}
                        className="rounded px-1.5 py-0.5 text-ink-500 hover:bg-cream-200 disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeProduct(id)}
                        className="rounded px-1.5 py-0.5 text-chili-500 hover:bg-chili-50"
                      >
                        Remove
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mb-2 text-sm text-ink-300">
              No salads added yet — the delivery cycle repeats in the order you add them below.
            </p>
          )}

          <div className="flex gap-2">
            <select
              value={nextProductToAdd}
              onChange={(e) => setNextProductToAdd(e.target.value)}
              className="flex-1 rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm text-ink-900"
            >
              <option value="">Select a salad to add…</option>
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
        </div>

        <Field
          label="Plan name"
          value={form.name}
          onChange={update('name')}
          placeholder="e.g. Fitness Combo"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Field as="select" label="Category" value={form.category} onChange={update('category')} required>
            <option value="VEG">VEG</option>
            <option value="NON_VEG">NON_VEG</option>
          </Field>

          <Field
            label="Price per week (₹)"
            type="number"
            step="0.01"
            value={form.price_per_week}
            onChange={update('price_per_week')}
            required
          />
        </div>

        <Field
          as="textarea"
          rows={3}
          label="Description"
          value={form.description}
          onChange={update('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field as="select" label="Status" value={form.status} onChange={update('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Field>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Plan Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-ink-700 file:mr-2 file:rounded-xl file:border-0 file:bg-cream-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-700 hover:file:bg-cream-200"
            />
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create plan
        </Button>
      </form>
    </Modal>
  )
}