import { useState, useRef, useEffect } from 'react'
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Repeat,
  Info,
  X,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import Button from '../ui/Button'
import { createProduct } from '../../api/products'
import { createSubscriptionPlan } from '../../api/subscriptions'
import { getApiErrorMessage } from '../../api/client'

const QUICK_CATEGORIES = [
  'Traditional Salads',
  'Artisanal Pickles',
  'Stone-Ground Podis',
  'Ready Gravies',
  'Traditional Sweets',
]

const emptyForm = {
  name: '',
  category: '',
  quantity: '',
  unit: 'g',
  selling_price: '',
  description: '',
  status: 'ACTIVE',
  saleType: 'storefront', // 'storefront' or 'subscription_only'
  subscribable: false,
  sub_name: '',
  sub_category: 'VEG',
  price_per_week: '',
}

export default function CreateProductModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // Manage image preview cleanup
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [imageFile])

  const resetForm = () => {
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    validateAndSetFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    validateAndSetFile(file)
  }

  const validateAndSetFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5 MB. Please choose a smaller image.')
      return
    }
    setError(null)
    setImageFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!form.name.trim()) {
      setError('Please enter a product name.')
      return
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Please provide a valid pack size quantity.')
      return
    }

    const isSubOnly = form.saleType === 'subscription_only'

    if (!isSubOnly && (!form.selling_price || Number(form.selling_price) <= 0)) {
      setError('Please provide a selling price for regular storefront products.')
      return
    }

    if (form.subscribable) {
      if (!form.sub_category) {
        setError('Select Veg or Non-Veg for the linked subscription plan.')
        return
      }
      if (!form.price_per_week || Number(form.price_per_week) <= 0) {
        setError('Please enter a valid weekly subscription price.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const productPayload = {
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        quantity: Number(form.quantity),
        unit: form.unit,
        selling_price: isSubOnly ? 0 : Number(form.selling_price),
        description: form.description.trim(),
        status: form.status,
        isSubscriptionOnly: isSubOnly,
        image: imageFile,
      }

      const res = await createProduct(productPayload)

      if (!res.success) {
        setError(res.message || 'Could not create product')
        setIsSubmitting(false)
        return
      }

      // If user enabled the linked subscription plan creation
      if (form.subscribable) {
        try {
          await createSubscriptionPlan({
            products: [{ product_id: res.product_id, delivery_order: 1 }],
            name: form.sub_name.trim() || `${form.name.trim()} Subscription`,
            category: form.sub_category,
            price_per_week: Number(form.price_per_week),
            status: 'ACTIVE',
          })
        } catch (planErr) {
          console.warn('Linked plan creation warning:', planErr)
        }
      }

      resetForm()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create product'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New Product"
      subtitle="Add authentic traditional food products, pickles, masalas, or subscription salads to Manoharam catalog."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-chili-500 hover:text-chili-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {/* SECTION A: Basic Information */}
        <div className="space-y-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
          <div className="border-b border-cream-200 pb-2">
            <h3 className="font-display text-sm font-bold text-ink-900">
              A. Basic Information
            </h3>
            <p className="text-[11px] text-ink-500">
              Identifies the dish or grocery item on customer listings and receipts.
            </p>
          </div>

          <Field
            label="Product Name"
            placeholder="e.g. Traditional Poondu (Garlic) Pickle"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />

          <div>
            <Field
              label="Category"
              placeholder="e.g. Artisanal Pickles, Salads, Stone-Ground Masalas"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              hint="Type a custom category or tap one of the suggested tags below."
              required
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    form.category === cat
                      ? 'bg-chili-600 text-cream-50 font-semibold'
                      : 'bg-cream-200/80 text-ink-700 hover:bg-cream-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Field
            as="textarea"
            rows={2.5}
            label="Product Description"
            placeholder="Describe the artisanal ingredients, heritage preparation, and motherly taste notes..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            optional
          />
        </div>

        {/* SECTION B: Product Size */}
        <div className="space-y-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
          <div className="flex items-center justify-between border-b border-cream-200 pb-2">
            <div>
              <h3 className="font-display text-sm font-bold text-ink-900">
                B. Pack Size & Net Quantity
              </h3>
              <p className="text-[11px] text-ink-500">
                Package weight per unit dispatched to customer.
              </p>
            </div>
            {form.quantity ? (
              <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-bold text-ink-800">
                Pack Size: {form.quantity} {form.unit}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Quantity"
              type="number"
              step="any"
              min="0.1"
              placeholder="e.g. 250 or 1"
              value={form.quantity}
              onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
              required
            />
            <Field
              as="select"
              label="Unit of Measure"
              value={form.unit}
              onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
            >
              <option value="g">Grams (g)</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="l">Liters (L)</option>
              <option value="pcs">Pieces (pcs)</option>
            </Field>
          </div>
        </div>

        {/* SECTION C: Pricing & Sales */}
        <div className="space-y-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
          <div className="border-b border-cream-200 pb-2">
            <h3 className="font-display text-sm font-bold text-ink-900">
              C. Sales & Order Method
            </h3>
            <p className="text-[11px] text-ink-500">
              Choose how customers can order this product.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Storefront Product */}
            <div
              onClick={() => setForm((p) => ({ ...p, saleType: 'storefront' }))}
              className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                form.saleType === 'storefront'
                  ? 'border-chili-500 bg-white shadow-xs'
                  : 'border-cream-300 bg-white/50 hover:border-cream-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag
                  className={`h-4 w-4 ${
                    form.saleType === 'storefront' ? 'text-chili-600' : 'text-ink-400'
                  }`}
                />
                <span className="font-bold text-xs text-ink-900">
                  Storefront Retail Product
                </span>
                {form.saleType === 'storefront' ? (
                  <CheckCircle2 className="h-4 w-4 ml-auto text-chili-600" />
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed">
                Listed in store catalog with direct "Add to Cart" button. Customer buys single units.
              </p>
            </div>

            {/* Option 2: Subscription-Only Product */}
            <div
              onClick={() => setForm((p) => ({ ...p, saleType: 'subscription_only' }))}
              className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                form.saleType === 'subscription_only'
                  ? 'border-chili-500 bg-white shadow-xs'
                  : 'border-cream-300 bg-white/50 hover:border-cream-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Repeat
                  className={`h-4 w-4 ${
                    form.saleType === 'subscription_only' ? 'text-chili-600' : 'text-ink-400'
                  }`}
                />
                <span className="font-bold text-xs text-ink-900">
                  Subscription-Only Product
                </span>
                {form.saleType === 'subscription_only' ? (
                  <CheckCircle2 className="h-4 w-4 ml-auto text-chili-600" />
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px] text-ink-500 leading-relaxed">
                Exclusively prepared for meal subscription rotations. Not sold as one-off cart items.
              </p>
            </div>
          </div>

          {form.saleType === 'storefront' ? (
            <Field
              label="Direct Selling Price"
              type="number"
              step="any"
              min="1"
              prefix="₹"
              placeholder="e.g. 299"
              value={form.selling_price}
              onChange={(e) => setForm((p) => ({ ...p, selling_price: e.target.value }))}
              hint="Unit price charged when customer checks out on the storefront."
              required
            />
          ) : (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-bold">No Direct Selling Price Required</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Customers subscribe to this product through recurring weekly plans. Storefront price is set to ₹0 and individual checkout is automatically disabled.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION D: Product Image */}
        <div className="space-y-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
          <div className="border-b border-cream-200 pb-2">
            <h3 className="font-display text-sm font-bold text-ink-900">
              D. Product Photography
            </h3>
            <p className="text-[11px] text-ink-500">
              Upload a clear, authentic food photo for storefront cards and detail pages.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-chili-500 bg-chili-50/40'
                  : 'border-cream-300 bg-white hover:border-chili-400 hover:bg-cream-50/50'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chili-50 text-chili-600">
                <Upload className="h-6 w-6 stroke-[1.8]" />
              </div>
              <div>
                <p className="text-xs font-bold text-ink-900">
                  Click to upload or drag & drop photo here
                </p>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  Supports JPG, PNG, WEBP (Max 5 MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3.5 rounded-2xl border border-cream-200 bg-white p-3">
              <img
                src={imagePreview}
                alt="Product preview"
                className="h-24 w-24 rounded-xl object-cover border border-cream-300 shrink-0"
              />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-ink-900 truncate">
                  {imageFile?.name}
                </p>
                <p className="text-[11px] text-ink-500 mt-0.5">
                  {(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(1)} KB · Photo ready for upload
                </p>
                <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-cream-100 hover:bg-cream-200 px-2.5 py-1 text-xs font-semibold text-ink-800 transition-colors"
                  >
                    Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="rounded-lg hover:bg-chili-50 px-2.5 py-1 text-xs font-semibold text-chili-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION E: Availability Status */}
        <div className="space-y-3.5 rounded-2xl border border-cream-200 bg-cream-50/50 p-4">
          <div className="border-b border-cream-200 pb-2">
            <h3 className="font-display text-sm font-bold text-ink-900">
              E. Catalog Availability
            </h3>
            <p className="text-[11px] text-ink-500">
              Controls whether customers can view and purchase this product right now.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-2.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                form.status === 'ACTIVE'
                  ? 'border-emerald-500 bg-white shadow-xs'
                  : 'border-cream-300 bg-white/50'
              }`}
            >
              <input
                type="radio"
                name="product_status"
                value="ACTIVE"
                checked={form.status === 'ACTIVE'}
                onChange={() => setForm((p) => ({ ...p, status: 'ACTIVE' }))}
                className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="block text-xs font-bold text-ink-900">
                  Active (Published)
                </span>
                <span className="block text-[11px] text-ink-500 mt-0.5 leading-relaxed">
                  Visible immediately to customers across the storefront and searchable.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 rounded-xl border-2 p-3 cursor-pointer transition-all ${
                form.status === 'INACTIVE'
                  ? 'border-ink-500 bg-white shadow-xs'
                  : 'border-cream-300 bg-white/50'
              }`}
            >
              <input
                type="radio"
                name="product_status"
                value="INACTIVE"
                checked={form.status === 'INACTIVE'}
                onChange={() => setForm((p) => ({ ...p, status: 'INACTIVE' }))}
                className="mt-0.5 text-ink-700 focus:ring-ink-500"
              />
              <div>
                <span className="block text-xs font-bold text-ink-900">
                  Inactive (Draft)
                </span>
                <span className="block text-[11px] text-ink-500 mt-0.5 leading-relaxed">
                  Hidden from customers. Preserved in admin panel for recipes or seasonal scheduling.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* SECTION F: Linked Subscription Plan (Conditional) */}
        <div className="rounded-2xl border border-chili-200 bg-chili-50/40 p-4 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.subscribable}
              onChange={(e) => setForm((p) => ({ ...p, subscribable: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-cream-300 text-chili-500 focus:ring-chili-400"
            />
            <div>
              <span className="flex items-center gap-1.5 text-xs font-bold text-ink-900">
                <Sparkles className="h-3.5 w-3.5 text-chili-600" />
                Also Create a Linked Subscription Plan
              </span>
              <span className="block text-[11px] text-ink-500 mt-0.5 leading-relaxed">
                Automatically registers this dish as Day 1 in a new weekly recurring meal plan so customers can subscribe right away.
              </span>
            </div>
          </label>

          {form.subscribable ? (
            <div className="pt-2 border-t border-chili-100 space-y-3 animate-in fade-in duration-200">
              <Field
                label="Subscription Plan Name"
                placeholder={form.name ? `${form.name} Weekly Plan` : 'e.g. Daily Homestyle Salad Combo'}
                value={form.sub_name}
                onChange={(e) => setForm((p) => ({ ...p, sub_name: e.target.value }))}
                hint="Displayed on the storefront Subscription Plans page."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  as="select"
                  label="Dietary Classification"
                  value={form.sub_category}
                  onChange={(e) => setForm((p) => ({ ...p, sub_category: e.target.value }))}
                  required
                >
                  <option value="VEG">Vegetarian (Pure Veg)</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </Field>

                <Field
                  label="Price Per Week"
                  type="number"
                  step="any"
                  min="1"
                  prefix="₹"
                  placeholder="e.g. 699"
                  value={form.price_per_week}
                  onChange={(e) => setForm((p) => ({ ...p, price_per_week: e.target.value }))}
                  required
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full sm:w-auto min-w-[150px]"
          >
            Create Product
          </Button>
        </div>
      </form>
    </Modal>
  )
}
