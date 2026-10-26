import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import { getProductDetails, updateProduct, deleteProduct } from '../api/products'
import { getApiErrorMessage } from '../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetails(id),
  })

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const product = data?.product

  const handleOpenEdit = () => {
    setForm({
      name: product.name || '',
      category: product.category || '',
      quantity: product.quantity || '',
      unit: product.unit || 'g',
      selling_price: product.selling_price || '',
      description: product.description || '',
      status: product.status || 'ACTIVE',
    })
    setImageFile(null)
    setError(null)
    setEditOpen(true)
  }

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await updateProduct({
        id: Number(id),
        ...form,
        quantity: Number(form.quantity),
        selling_price: Number(form.selling_price),
        image: imageFile,
      })

      if (res.success) {
        setEditOpen(false)
        refetch()
        queryClient.invalidateQueries({ queryKey: ['products'] })
      } else {
        setError(res.message || 'Could not update product')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update product'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const res = await deleteProduct({ productId: id, force: false })
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] })
        navigate('/products')
      } else {
        setError(res.message || 'Could not deactivate product')
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not deactivate product'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <p className="text-center text-ink-300">Loading…</p>
      </DashboardShell>
    )
  }

  if (isError || !product) {
    return (
      <DashboardShell>
        <p className="text-center text-chili-500">Couldn't load this product.</p>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ChevronLeft className="h-4 w-4" /> Back to products
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleOpenEdit}>
            <Edit2 className="h-4 w-4" /> Edit product
          </Button>
          {product.status === 'ACTIVE' ? (
            <Button
              variant="ghost"
              onClick={() => setDeleteOpen(true)}
              className="text-chili-500 hover:bg-chili-50"
            >
              <Trash2 className="h-4 w-4" /> Deactivate
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <ProductImage src={product.image_url} alt={product.name} className="h-56 w-full" />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h1 className="font-display text-xl font-semibold text-ink-900">
                  {product.name}
                </h1>
                <Badge tone={toneForStatus(product.status)}>
                  {formatStatusLabel(product.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-500">{product.category || 'Uncategorised'}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-ink-700">
                <p className="font-display text-lg font-semibold text-chili-500">
                  ₹{Number(product.selling_price).toFixed(0)}
                  <span className="ml-1 text-xs font-normal text-ink-300">/ {product.unit}</span>
                </p>
                <p className="text-ink-500">
                  {product.quantity} {product.unit}
                </p>
              </div>
              {product.description ? (
                <p className="mt-3 text-sm text-ink-500">{product.description}</p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Nutrition</h2>
            <div className="mt-3 grid grid-cols-5 gap-3 text-center">
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {product.nutrition?.calories ?? 0}
                </p>
                <p className="text-xs text-ink-300">kcal</p>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {product.nutrition?.protein ?? 0}g
                </p>
                <p className="text-xs text-ink-300">Protein</p>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {product.nutrition?.carbs ?? 0}g
                </p>
                <p className="text-xs text-ink-300">Carbs</p>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {product.nutrition?.fat ?? 0}g
                </p>
                <p className="text-xs text-ink-300">Fat</p>
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink-900">
                  {product.nutrition?.fiber ?? 0}g
                </p>
                <p className="text-xs text-ink-300">Fiber</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink-900">Ingredients</h2>
            {product.ingredients?.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {product.ingredients.map((ingredient) => (
                  <li
                    key={ingredient}
                    className="rounded-full border border-cream-200 bg-cream-50 px-3 py-1 text-sm text-ink-700"
                  >
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-300">No recipe linked to this product.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Edit Product Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit ${product.name}`}>
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <Field
            label="Product Name"
            required
            value={form.name || ''}
            onChange={updateField('name')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Category"
              required
              value={form.category || ''}
              onChange={updateField('category')}
            />
            <Field
              as="select"
              label="Status"
              value={form.status || 'ACTIVE'}
              onChange={updateField('status')}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              type="number"
              step="any"
              label="Quantity"
              required
              value={form.quantity || ''}
              onChange={updateField('quantity')}
            />
            <Field
              as="select"
              label="Unit"
              value={form.unit || 'g'}
              onChange={updateField('unit')}
            >
              <option value="g">g (grams)</option>
              <option value="kg">kg (kilograms)</option>
            </Field>
            <Field
              type="number"
              step="any"
              label="Price (₹)"
              required
              value={form.selling_price || ''}
              onChange={updateField('selling_price')}
            />
          </div>

          <Field
            as="textarea"
            rows={3}
            label="Description"
            value={form.description || ''}
            onChange={updateField('description')}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Replace Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-ink-500 file:mr-3 file:rounded-pill file:border-0 file:bg-cream-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-ink-700 hover:file:bg-cream-300"
            />
          </div>

          {error ? <p className="text-xs font-medium text-chili-500">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Deactivate Product">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-chili-500">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <p className="text-sm text-ink-700">
              Are you sure you want to deactivate <strong>{product.name}</strong>? It will no longer appear on the customer storefront.
            </p>
          </div>

          {error ? <p className="text-xs font-medium text-chili-500">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button onClick={handleDeleteProduct} loading={isDeleting} className="bg-chili-500 text-cream-50 hover:bg-chili-600">
              Yes, deactivate product
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardShell>
  )
}