import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Edit2,
  Trash2,
  Sparkles,
  Tag,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  UtensilsCrossed,
} from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Field from '../components/ui/Field'
import ProductImage from '../components/ui/ProductImage'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
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
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const product = data?.product

  const handleOpenEdit = () => {
    setForm({
      name: product?.name || '',
      category: product?.category || '',
      quantity: product?.quantity || '',
      unit: product?.unit || 'g',
      selling_price: product?.selling_price ?? '',
      description: product?.description || '',
      status: product?.status || 'ACTIVE',
      is_subscription_only: Boolean(product?.is_subscription_only || product?.subscription_only),
    })
    setImageFile(null)
    setRemoveImage(false)
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
        selling_price: form.is_subscription_only
          ? Number(form.selling_price || 0)
          : Number(form.selling_price),
        isSubscriptionOnly: form.is_subscription_only,
        image: imageFile,
        removeImage: removeImage,
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
      setDeleteOpen(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="py-20 text-center text-xs text-ink-400 animate-pulse">
          Loading product specifications…
        </div>
      </DashboardShell>
    )
  }

  if (isError || !product) {
    return (
      <DashboardShell>
        <Card className="p-8 text-center text-chili-600">
          <p className="text-sm font-semibold">Couldn't load this product.</p>
          <div className="mt-4">
            <Button size="sm" onClick={() => navigate('/products')}>
              Return to Catalog
            </Button>
          </div>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      {/* Top Navigation & Action Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-600 hover:text-chili-600 transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenEdit}
            className="flex-1 sm:flex-initial"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Product</span>
          </Button>

          {product.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="flex-1 sm:flex-initial text-chili-600 hover:bg-chili-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Deactivate</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Responsive Grid Layout (1 col mobile, 3 cols desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Hero Image, Details, Nutrition */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-cream-100 overflow-hidden">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                category={product.category}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <Badge tone={toneForStatus(product.status)}>
                  {formatStatusLabel(product.status)}
                </Badge>
              </div>

              {product.is_subscription_only ? (
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-900/90 px-2.5 py-1 text-xs font-bold text-cream-50 backdrop-blur-xs shadow-xs">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Subscription-Only Delicacy
                  </span>
                </div>
              ) : null}
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
                  {product.category || 'General'}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-950 mt-1">
                  {product.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 py-3 border-y border-cream-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
                    {product.is_subscription_only ? 'Plan Category' : 'Direct Selling Price'}
                  </span>
                  <p className="font-display text-xl sm:text-2xl font-bold text-chili-600">
                    {Number(product.selling_price) > 0
                      ? `₹${Number(product.selling_price).toFixed(0)}`
                      : 'Included in Plan'}
                    <span className="text-xs font-normal text-ink-500 ml-1">/ unit</span>
                  </p>
                </div>

                <div className="h-8 w-px bg-cream-200 hidden sm:block" />

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block">
                    Pack Size
                  </span>
                  <p className="font-display text-xl sm:text-2xl font-bold text-ink-900">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              </div>

              {product.description ? (
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Culinary Description
                  </h3>
                  <p className="text-sm text-ink-700 leading-relaxed font-sans">
                    {product.description}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Nutrition Facts */}
          <Card className="p-5 sm:p-6">
            <h2 className="font-display text-base font-bold text-ink-900 mb-1">
              Nutritional Breakdown
            </h2>
            <p className="text-xs text-ink-500 mb-4">
              Calculated dynamically from linked recipe ingredients per serving.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-3">
                <p className="font-display text-xl font-bold text-ink-900">
                  {Math.round(product.nutrition?.calories ?? 0)}
                </p>
                <p className="text-[10px] uppercase font-bold text-ink-400 mt-0.5">kcal</p>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-3">
                <p className="font-display text-xl font-bold text-ink-900">
                  {Math.round(product.nutrition?.protein ?? 0)}g
                </p>
                <p className="text-[10px] uppercase font-bold text-ink-400 mt-0.5">Protein</p>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-3">
                <p className="font-display text-xl font-bold text-ink-900">
                  {Math.round(product.nutrition?.carbs ?? 0)}g
                </p>
                <p className="text-[10px] uppercase font-bold text-ink-400 mt-0.5">Carbs</p>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-3">
                <p className="font-display text-xl font-bold text-ink-900">
                  {Math.round(product.nutrition?.fat ?? 0)}g
                </p>
                <p className="text-[10px] uppercase font-bold text-ink-400 mt-0.5">Fat</p>
              </div>
              <div className="rounded-xl border border-cream-200 bg-cream-50/50 p-3 col-span-2 sm:col-span-1">
                <p className="font-display text-xl font-bold text-ink-900">
                  {Math.round(product.nutrition?.fiber ?? 0)}g
                </p>
                <p className="text-[10px] uppercase font-bold text-ink-400 mt-0.5">Fiber</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Ingredients, Recipe Link, Inventory Link */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-display text-base font-bold text-ink-900">
              Recipe Ingredients
            </h3>

            {product.ingredients?.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {product.ingredients.map((ingredient, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg border border-cream-200 bg-cream-50 px-2.5 py-1 text-xs font-medium text-ink-800"
                  >
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-xs text-ink-400">
                <p>No ingredients attached yet.</p>
                <Link
                  to="/recipes"
                  className="mt-2 inline-block text-xs font-bold text-chili-600 hover:underline"
                >
                  Configure recipe in Recipes & Nutrition →
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Operations Sidebar Card */}
          <Card className="p-5 space-y-3 bg-cream-50/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">
              Quick Operations
            </h4>
            <div className="space-y-2">
              <Link
                to={`/inventory`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-cream-200 text-xs font-semibold text-ink-900 hover:border-chili-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-chili-600" />
                  <span>Check Inventory Stock</span>
                </div>
                <span>→</span>
              </Link>
              <Link
                to={`/recipes`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-cream-200 text-xs font-semibold text-ink-900 hover:border-chili-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-chili-600" />
                  <span>Manage Recipe Ratios</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* EDIT PRODUCT MODAL */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${product.name}`}
        subtitle="Modify product specs, pricing, and photo."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          ) : null}

          <Field
            label="Product Name"
            required
            value={form.name || ''}
            onChange={updateField('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Category"
              required
              value={form.category || ''}
              onChange={updateField('category')}
            />
            <Field
              as="select"
              label="Availability Status"
              value={form.status || 'ACTIVE'}
              onChange={updateField('status')}
            >
              <option value="ACTIVE">Active (Published)</option>
              <option value="INACTIVE">Inactive (Draft)</option>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (L)</option>
              <option value="pcs">Pieces (pcs)</option>
            </Field>
            <Field
              type="number"
              step="any"
              prefix="₹"
              label={`Price${form.is_subscription_only ? ' (Optional)' : ''}`}
              required={!form.is_subscription_only}
              value={form.selling_price || ''}
              onChange={updateField('selling_price')}
            />
          </div>

          <div className="rounded-xl border border-cream-300 bg-cream-50 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_subscription_only || false}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, is_subscription_only: e.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-cream-300 text-chili-500 focus:ring-chili-400"
              />
              <div>
                <span className="block text-xs font-bold text-ink-900">
                  Subscription-Only Delicacy
                </span>
                <span className="block text-[11px] text-ink-500 mt-0.5">
                  Prepares this delicacy exclusively for weekly subscription rotations. Excluded from direct cart purchases.
                </span>
              </div>
            </label>
          </div>

          <Field
            as="textarea"
            rows={3}
            label="Description"
            value={form.description || ''}
            onChange={updateField('description')}
          />

          {/* Photo upload / replace */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink-800">
              Product Image
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-3">
              <ProductImage
                src={imageFile ? URL.createObjectURL(imageFile) : removeImage ? '' : product.image_url}
                alt={product.name}
                className="h-16 w-16 rounded-xl object-cover border border-cream-300 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setImageFile(file)
                    if (file) setRemoveImage(false)
                  }}
                  className="w-full text-xs text-ink-500 file:mr-2 file:rounded-lg file:border-0 file:bg-cream-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-ink-700 hover:file:bg-cream-200"
                />
                {imageFile ? (
                  <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                    ✓ New image ready: {imageFile.name}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditOpen(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full sm:w-auto min-w-[130px]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DEACTIVATE DIALOG */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProduct}
        title="Deactivate Product?"
        description={`Are you sure you want to deactivate "${product.name}"? It will immediately be hidden from customers on the public storefront.`}
        confirmLabel="Yes, Deactivate"
        isLoading={isDeleting}
      />
    </DashboardShell>
  )
}