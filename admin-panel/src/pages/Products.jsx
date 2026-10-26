import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Sparkles, Layers } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import { useCursorList } from '../hooks/useCursorList'
import { listProducts, createProduct } from '../api/products'
import { createSubscriptionPlan } from '../api/subscriptions'
import { getApiErrorMessage } from '../api/client'

const emptyForm = {
  name: '',
  category: '',
  quantity: '',
  unit: 'g',
  selling_price: '',
  description: '',
  status: 'ACTIVE',
}

const emptySubForm = {
  subscribable: false,
  sub_name: '',
  sub_category: '',
  price_per_week: '',
}

const emptyMultiPlanForm = {
  name: '',
  category: '',
  price_per_week: '',
  description: '',
  status: 'ACTIVE',
}

export default function Products() {
  const { items: products, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCursorList({ queryKey: ['products'], queryFn: listProducts, itemsKey: 'products' })

  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [subForm, setSubForm] = useState(emptySubForm)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  const updateSub = (field) => (e) =>
    setSubForm((prev) => ({
      ...prev,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const resetAndClose = () => {
    setForm(emptyForm)
    setImageFile(null)
    setSubForm(emptySubForm)
    setError(null)
    setModalOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (subForm.subscribable && !subForm.sub_category) {
      setError('Pick a category (Veg / Non-veg) for the subscription plan.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await createProduct({
        ...form,
        quantity: Number(form.quantity),
        selling_price: Number(form.selling_price),
        image: imageFile,
      })

      if (!data.success) {
        setError(data.message || 'Could not create product')
        setIsSubmitting(false)
        return
      }

      // If "Make subscribable" was checked, immediately create the linked
      // subscription plan for this brand-new product. If that second step
      // fails, the product itself still exists — we surface the plan error
      // separately rather than pretending the whole thing failed.
      if (subForm.subscribable) {
        try {
          const planData = await createSubscriptionPlan({
            products: [
              { product_id: data.product_id, delivery_order: 1 },
            ],
            name: subForm.sub_name || `${form.name} Subscription`,
            category: subForm.sub_category,
            price_per_week: Number(subForm.price_per_week),
            status: 'ACTIVE',
          })

          if (!planData.success) {
            setError(
              `Product created, but the subscription plan could not be added: ${planData.message}`
            )
            queryClient.invalidateQueries({ queryKey: ['products'] })
            setIsSubmitting(false)
            return
          }
        } catch (planErr) {
          setError(
            `Product created, but the subscription plan could not be added: ${getApiErrorMessage(planErr)}`
          )
          queryClient.invalidateQueries({ queryKey: ['products'] })
          setIsSubmitting(false)
          return
        }
      }

      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
      resetAndClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create product'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Products"
        description="Salads, pickles, and masalas on the storefront menu."
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setSubscriptionModalOpen(true)}>
              <Layers className="h-4 w-4" /> Create subscription
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> New product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md hover:shadow-ink-900/10">
              <ProductImage src={product.image_url} alt={product.name} className="h-36 w-full" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-ink-900">
                    {product.name}
                  </h3>
                  <Badge tone={toneForStatus(product.status)}>
                    {formatStatusLabel(product.status)}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-ink-500">{product.category || 'Uncategorised'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="font-display text-lg font-semibold text-chili-500">
                    ₹{Number(product.selling_price).toFixed(0)}
                    <span className="ml-1 text-xs font-normal text-ink-300">/ {product.unit}</span>
                  </p>
                  <p className="text-xs text-ink-300">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {isLoading ? <p className="py-10 text-center text-ink-300">Loading…</p> : null}
      {isError ? (
        <p className="py-10 text-center text-chili-500">Couldn't load products.</p>
      ) : null}
      {!isLoading && products.length === 0 ? (
        <Card className="p-10 text-center text-ink-300">
          No products yet — create your first one to get started.
        </Card>
      ) : null}

      {hasNextPage ? (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}

      <Modal open={modalOpen} onClose={resetAndClose} title="New product" maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name" value={form.name} onChange={update('name')} required />
          <Field
            label="Category"
            value={form.category}
            onChange={update('category')}
            hint="e.g. Salads, Pickles, Masalas"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Quantity"
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={update('quantity')}
              required
            />
            <Field as="select" label="Unit" value={form.unit} onChange={update('unit')}>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </Field>
          </div>

          <Field
            label="Selling price (₹)"
            type="number"
            step="0.01"
            value={form.selling_price}
            onChange={update('selling_price')}
            required
          />

          <Field as="textarea" rows={3} label="Description" value={form.description} onChange={update('description')} />

          {/* create_product.php only accepts an uploaded file (it builds
              image_url itself from $_FILES["image"]) — there's no field
              for passing an image URL string directly. */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              Product image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-chili-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-chili-600 hover:file:bg-chili-100"
            />
          </div>

          <Field as="select" label="Status" value={form.status} onChange={update('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Field>

          {/* Subscription toggle — only meaningful for salads, but left
              available for any product since admin discretion decides
              what's subscribable. */}
          <div className="rounded-2xl border border-chili-100 bg-chili-50/40 p-4">
            <label className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={subForm.subscribable}
                onChange={updateSub('subscribable')}
                className="h-4 w-4 rounded border-cream-300 text-chili-500 focus:ring-chili-400"
              />
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                <Sparkles className="h-4 w-4 text-chili-500" />
                Make this salad subscribable
              </span>
            </label>

            {subForm.subscribable ? (
              <div className="mt-3 space-y-3">
                <Field
                  label="Subscription plan name"
                  value={subForm.sub_name}
                  onChange={updateSub('sub_name')}
                  placeholder={form.name ? `${form.name} Subscription` : 'e.g. Veg Salad for Fitness'}
                />
                <Field as="select" label="Category" value={subForm.sub_category} onChange={updateSub('sub_category')} required>
                  <option value="">Select category…</option>
                  <option value="VEG">Veg</option>
                  <option value="NON_VEG">Non-veg</option>
                </Field>
                <Field
                  label="Price per week (₹)"
                  type="number"
                  step="0.01"
                  value={subForm.price_per_week}
                  onChange={updateSub('price_per_week')}
                  required
                />
              </div>
            ) : null}
          </div>

          {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Create product
          </Button>
        </form>
      </Modal>

      <CreateSubscriptionModal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        products={products}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
        }}
      />
    </DashboardShell>
  )
}

/**
 * Standalone flow for create_subscription_plan.php's real contract: pick
 * any number of EXISTING products, set their delivery order, choose a
 * category (VEG | NON_VEG — required by the backend), and create one plan
 * that rotates through them at a single weekly price. Independent of
 * product creation — this never creates a product.
 */
function CreateSubscriptionModal({ open, onClose, onCreated, products }) {
  const [form, setForm] = useState(emptyMultiPlanForm)
  const [imageFile, setImageFile] = useState(null)
  // Order of this array IS delivery_order, matching subscription_plan_products.
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [nextProductToAdd, setNextProductToAdd] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const productById = (id) => products.find((p) => String(p.id) === String(id))

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
    setForm(emptyMultiPlanForm)
    setImageFile(null)
    setSelectedProductIds([])
    setNextProductToAdd('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (selectedProductIds.length === 0) {
      setError('Add at least one product to this plan.')
      return
    }

    if (!form.category) {
      setError('Pick a category (Veg / Non-veg) for this plan.')
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
        category: form.category,
        price_per_week: Number(form.price_per_week),
        description: form.description,
        status: form.status,
        image: imageFile,
      })

      if (data.success) {
        onCreated()
        resetAndClose()
      } else {
        setError(data.message || 'Could not create subscription plan')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not create subscription plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableProducts = products.filter((p) => !selectedProductIds.includes(String(p.id)))

  return (
    <Modal open={open} onClose={resetAndClose} title="Create subscription plan" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Products in this plan
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
              No products added yet — the delivery cycle repeats in the order you add them below.
            </p>
          )}

          <div className="flex gap-2">
            <select
              value={nextProductToAdd}
              onChange={(e) => setNextProductToAdd(e.target.value)}
              className="flex-1 rounded-xl border border-cream-200 bg-white px-3 py-2 text-sm text-ink-900"
            >
              <option value="">Select a product to add…</option>
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

        <Field as="select" label="Category" value={form.category} onChange={update('category')} required>
          <option value="">Select category…</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non-veg</option>
        </Field>

        <Field
          label="Price per week (₹)"
          type="number"
          step="0.01"
          value={form.price_per_week}
          onChange={update('price_per_week')}
          required
        />

        <Field
          as="textarea"
          rows={3}
          label="Description"
          value={form.description}
          onChange={update('description')}
        />

        {/* create_subscription_plan.php also accepts an optional image
            file (same $_FILES["image"] contract as product creation). */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            Plan image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-ink-700 file:mr-3 file:rounded-lg file:border-0 file:bg-chili-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-chili-600 hover:file:bg-chili-100"
          />
        </div>

        <Field as="select" label="Status" value={form.status} onChange={update('status')}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </Field>

        {error ? <p className="text-sm font-medium text-chili-500">{error}</p> : null}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create subscription plan
        </Button>
      </form>
    </Modal>
  )
}