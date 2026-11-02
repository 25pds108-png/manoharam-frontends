import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Sparkles,
  AlertCircle,
  CalendarCheck,
  Search,
  Upload,
  Info,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ProductImage from '../ui/ProductImage'
import { listSubscriptionProducts } from '../../api/products'
import { createSubscriptionPlan } from '../../api/subscriptions'
import { getApiErrorMessage } from '../../api/client'

const STEPS = [
  { num: 1, title: 'Plan Details', subtitle: 'Name, price & info' },
  { num: 2, title: 'Pick Products', subtitle: 'Choose recipe items' },
  { num: 3, title: 'Delivery Rotation', subtitle: 'Day-by-day sequence' },
  { num: 4, title: 'Review & Create', subtitle: 'Confirm & publish' },
]

export default function CreatePlanWizardModal({ open, onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Plan Details
  const [name, setName] = useState('')
  const [category, setCategory] = useState('VEG')
  const [pricePerWeek, setPricePerWeek] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('ACTIVE')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  // Step 2: Selected products pool
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')

  // Step 3: Sequence of delivery days (array of product IDs in order)
  const [rotationSequence, setRotationSequence] = useState([])

  // Manage image preview
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // Fetch catalog products
  const productsQuery = useQuery({
    queryKey: ['subscription-products-catalog'],
    queryFn: () => listSubscriptionProducts(),
    enabled: open,
  })

  const catalogProducts = productsQuery.data?.products || []

  // Initialize rotation sequence when products are selected
  useEffect(() => {
    if (rotationSequence.length === 0 && selectedProductIds.length > 0) {
      setRotationSequence([...selectedProductIds])
    }
  }, [selectedProductIds])

  const resetAll = () => {
    setCurrentStep(1)
    setName('')
    setCategory('VEG')
    setPricePerWeek('')
    setDescription('')
    setStatus('ACTIVE')
    setImageFile(null)
    setImagePreview(null)
    setSelectedProductIds([])
    setRotationSequence([])
    setSearchQuery('')
    setFilterCategory('ALL')
    setError(null)
  }

  const handleClose = () => {
    resetAll()
    onClose()
  }

  // Toggle product selection in Step 2
  const toggleProductSelect = (productId) => {
    setSelectedProductIds((prev) => {
      const exists = prev.includes(productId)
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId]
      // Also update rotation sequence
      if (exists) {
        setRotationSequence((seq) => seq.filter((id) => id !== productId))
      } else {
        setRotationSequence((seq) => [...seq, productId])
      }
      return next
    })
  }

  // Rotation sequence controls in Step 3
  const moveItem = (index, direction) => {
    setRotationSequence((prev) => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const updated = [...prev]
      ;[updated[index], updated[target]] = [updated[target], updated[index]]
      return updated
    })
  }

  const removeItemFromRotation = (index) => {
    setRotationSequence((prev) => prev.filter((_, i) => i !== index))
  }

  const addItemToRotation = (productId) => {
    setRotationSequence((prev) => [...prev, productId])
  }

  const getProductById = (id) => catalogProducts.find((p) => String(p.id) === String(id))

  // Step Navigation Validation
  const goToNextStep = () => {
    setError(null)
    if (currentStep === 1) {
      if (!name.trim()) {
        setError('Please enter a subscription plan name.')
        return
      }
      if (!pricePerWeek || Number(pricePerWeek) <= 0) {
        setError('Please enter a valid weekly subscription price.')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (selectedProductIds.length === 0) {
        setError('Please select at least one product to include in this plan.')
        return
      }
      setCurrentStep(3)
    } else if (currentStep === 3) {
      if (rotationSequence.length === 0) {
        setError('The rotation must contain at least one scheduled delivery day.')
        return
      }
      setCurrentStep(4)
    }
  }

  const goToPrevStep = () => {
    setError(null)
    setCurrentStep((s) => Math.max(1, s - 1))
  }

  // Final creation submission
  const handleFinalSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        category,
        price_per_week: Number(pricePerWeek),
        description: description.trim(),
        status,
        image: imageFile,
        products: rotationSequence.map((productId, idx) => ({
          product_id: Number(productId),
          delivery_order: idx + 1,
        })),
      }

      const res = await createSubscriptionPlan(payload)

      if (!res.success) {
        setError(res.message || 'Could not create subscription plan')
        setIsSubmitting(false)
        return
      }

      resetAll()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create subscription plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter products for Step 2
  const filteredProducts = catalogProducts.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      filterCategory === 'ALL' ||
      p.category?.toLowerCase().includes(filterCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Subscription Meal Plan"
      subtitle="4-Step Visual Wizard to configure weekly recurring subscription plans and delivery rotations."
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* STEPPER HEADER */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-cream-200 pb-4">
          {STEPS.map((s) => {
            const isDone = currentStep > s.num
            const isCurrent = currentStep === s.num
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-chili-50 border border-chili-200 text-chili-700 shadow-2xs'
                    : isDone
                    ? 'text-emerald-700 bg-emerald-50/50'
                    : 'text-ink-400 bg-cream-50/40 opacity-70'
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-cream-50'
                      : isCurrent
                      ? 'bg-chili-600 text-cream-50'
                      : 'bg-cream-200 text-ink-600'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate leading-tight">{s.title}</p>
                  <p className="hidden sm:block text-[10px] text-ink-500 truncate leading-tight">
                    {s.subtitle}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ERROR BANNER */}
        {error ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-chili-200 bg-chili-50 p-3 text-xs text-chili-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-chili-600" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* STEP 1: PLAN INFORMATION */}
        {/* ============================================================== */}
        {currentStep === 1 ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-3.5">
              <Field
                label="Subscription Plan Name"
                placeholder="e.g. Daily Homestyle Veg Feast Combo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                hint="Displayed prominently to customers on the subscription catalogue and checkout."
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  as="select"
                  label="Dietary Classification"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="VEG">Vegetarian (Pure Veg)</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </Field>

                <Field
                  label="Weekly Subscription Price"
                  type="number"
                  step="any"
                  min="1"
                  prefix="₹"
                  placeholder="e.g. 699"
                  value={pricePerWeek}
                  onChange={(e) => setPricePerWeek(e.target.value)}
                  hint="Base cycle price for 1 week (e.g. 6 delivery days)."
                  required
                />
              </div>

              <Field
                as="textarea"
                rows={2.5}
                label="Plan Description"
                placeholder="Highlight the health benefits, fresh morning preparation, and variety in rotation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                optional
              />
            </div>

            {/* Plan Image & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-2">
                <label className="text-xs font-semibold text-ink-800 block">
                  Plan Header Photo (Optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-cream-300 bg-white p-4 text-center cursor-pointer hover:border-chili-400"
                  >
                    <Upload className="h-5 w-5 text-chili-600" />
                    <p className="text-xs font-semibold text-ink-800">
                      Upload Feast Cover
                    </p>
                    <p className="text-[10px] text-ink-400">JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-cream-200 bg-white p-2">
                    <img
                      src={imagePreview}
                      alt="Plan preview"
                      className="h-14 w-14 rounded-lg object-cover border border-cream-300 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink-900 truncate">
                        {imageFile?.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                        className="text-[11px] font-semibold text-chili-600 hover:underline mt-0.5"
                      >
                        Remove photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-4 space-y-2">
                <label className="text-xs font-semibold text-ink-800 block">
                  Publishing Status
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-cream-200 cursor-pointer">
                    <input
                      type="radio"
                      name="plan_status"
                      value="ACTIVE"
                      checked={status === 'ACTIVE'}
                      onChange={() => setStatus('ACTIVE')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-ink-900">
                      Active (Accept Subscriptions)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-cream-200 cursor-pointer">
                    <input
                      type="radio"
                      name="plan_status"
                      value="INACTIVE"
                      checked={status === 'INACTIVE'}
                      onChange={() => setStatus('INACTIVE')}
                      className="text-ink-600 focus:ring-ink-500"
                    />
                    <span className="text-xs font-bold text-ink-900">
                      Inactive (Draft Mode)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* STEP 2: SELECT PRODUCTS */}
        {/* ============================================================== */}
        {currentStep === 2 ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-cream-50/80 p-3 rounded-2xl border border-cream-200">
              <div className="relative flex-1">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search products by dish name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-cream-300 bg-white text-xs outline-none focus:border-chili-500"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                <span className="font-bold text-ink-800">
                  {selectedProductIds.length} Selected
                </span>
                {selectedProductIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedProductIds([])}
                    className="text-chili-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                ) : null}
              </div>
            </div>

            {/* Products Selectable Card Grid */}
            <div className="max-h-[380px] overflow-y-auto pr-1 scrollbar-none">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-ink-400 border border-dashed border-cream-300 rounded-2xl">
                  No matching products found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((p) => {
                    const isSelected = selectedProductIds.includes(p.id)
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelect(p.id)}
                        className={`group relative flex items-start gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-chili-500 bg-chili-50/20 shadow-xs'
                            : 'border-cream-200 bg-white hover:border-cream-400 hover:shadow-2xs'
                        }`}
                      >
                        <ProductImage
                          src={p.image_url}
                          alt={p.name}
                          className="h-14 w-14 rounded-xl object-cover border border-cream-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-ink-900 truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-ink-500 truncate mt-0.5">
                            {p.category || 'General'}
                          </p>
                          <span className="inline-block rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-semibold text-ink-700 mt-1.5">
                            {p.quantity} {p.unit}
                          </span>
                        </div>

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-chili-600 bg-chili-600 text-cream-50'
                              : 'border-cream-300 bg-white group-hover:border-cream-400'
                          }`}
                        >
                          {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* STEP 3: DELIVERY ROTATION SEQUENCE BUILDER */}
        {/* ============================================================== */}
        {currentStep === 3 ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
              <div>
                <p className="font-bold">How Subscription Rotation Works</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Subscribers receive meals in the exact order configured below. For a 2 or 4-week subscription, the cycle automatically loops back to Day 1 once Day {rotationSequence.length} is reached. You can add the same dish multiple times (e.g. Day 1 and Day 4).
                </p>
              </div>
            </div>

            {/* Sequence List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-none">
              {rotationSequence.map((productId, index) => {
                const product = getProductById(productId)
                return (
                  <div
                    key={`${productId}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-cream-200 bg-white p-3 shadow-2xs hover:border-cream-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-14 shrink-0 items-center justify-center rounded-lg bg-chili-600 text-xs font-bold text-cream-50 shadow-2xs">
                        Day {index + 1}
                      </span>
                      <ProductImage
                        src={product?.image_url}
                        alt={product?.name}
                        className="h-10 w-10 rounded-xl object-cover border border-cream-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink-900 truncate">
                          {product?.name || `Product #${productId}`}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {product?.quantity} {product?.unit} · {product?.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        title="Move Up"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-600 hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === rotationSequence.length - 1}
                        title="Move Down"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-600 hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItemFromRotation(index)}
                        title="Remove Day"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-chili-600 hover:bg-chili-50 ml-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Add Another Day from Pool */}
            <div className="rounded-2xl border border-cream-200 bg-cream-50/50 p-3">
              <p className="text-xs font-bold text-ink-800 mb-2">
                Add another delivery day from selected dishes:
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProductIds.map((id) => {
                  const p = getProductById(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => addItemToRotation(id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink-800 hover:bg-cream-100 active:scale-95 transition-all"
                    >
                      <Plus className="h-3 w-3 text-chili-600" />
                      <span>{p?.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* STEP 4: REVIEW & CREATE */}
        {/* ============================================================== */}
        {currentStep === 4 ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Master Summary Card */}
            <div className="rounded-2xl border border-cream-200 bg-gradient-to-br from-cream-50 to-white p-4.5 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
                <div className="flex items-center gap-3.5">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={name}
                      className="h-16 w-16 rounded-2xl object-cover border border-cream-300 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-200 text-chili-600 font-bold shrink-0">
                      <UtensilsCrossed className="h-7 w-7" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone={category === 'VEG' ? 'success' : 'danger'}>
                        {category === 'VEG' ? 'Vegetarian' : 'Non-Veg'}
                      </Badge>
                      <Badge tone={status === 'ACTIVE' ? 'success' : 'neutral'}>
                        {status}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-950 mt-1">
                      {name}
                    </h3>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block">
                    Weekly Rate
                  </span>
                  <span className="font-display text-2xl font-bold text-chili-600">
                    ₹{Number(pricePerWeek).toLocaleString('en-IN')}
                    <span className="text-xs text-ink-500 font-normal"> / week</span>
                  </span>
                </div>
              </div>

              {description ? (
                <p className="pt-3 text-xs text-ink-600 leading-relaxed">
                  {description}
                </p>
              ) : null}
            </div>

            {/* Scheduled Days Timeline */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-700">
                  Delivery Rotation ({rotationSequence.length} Days in Cycle)
                </h4>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-chili-600 hover:underline"
                >
                  Edit Sequence
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rotationSequence.map((productId, idx) => {
                  const product = getProductById(productId)
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-cream-200 bg-white p-2.5 shadow-2xs"
                    >
                      <span className="flex h-6 w-12 shrink-0 items-center justify-center rounded-md bg-chili-50 text-[11px] font-bold text-chili-700">
                        Day {idx + 1}
                      </span>
                      <ProductImage
                        src={product?.image_url}
                        alt={product?.name}
                        className="h-8 w-8 rounded-lg object-cover border border-cream-200 shrink-0"
                      />
                      <span className="text-xs font-medium text-ink-900 truncate">
                        {product?.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* ============================================================== */}
        {/* WIZARD ACTION CONTROLS */}
        {/* ============================================================== */}
        <div className="pt-4 border-t border-cream-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={currentStep === 1 ? handleClose : goToPrevStep}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" /> Back
              </>
            )}
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              className="w-full sm:w-auto min-w-[140px]"
            >
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleFinalSubmit}
              loading={isSubmitting}
              className="w-full sm:w-auto min-w-[180px]"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Create Plan</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
