import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Minus,
  Plus,
  Star,
  MessageSquarePlus,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  X,
  ShoppingBag,
  Check,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ProductImage from '../components/ProductImage'
import Button from '../components/ui/Button'
import { getProductDetails } from '../api/products'
import { getProductReviews, addReview } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, isAdding } = useCart()
  const { showToast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetails(id),
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => getProductReviews(id),
    enabled: Boolean(id),
  })

  const product = data?.product

  // Clean product name and unit formatting
  const cleanName = useMemo(() => {
    if (!product?.name) return 'Manoharam Delicacy'
    return product.name.replace(/^\[(Test|Verify)\]\s*/i, '').trim()
  }, [product?.name])

  const cleanUnit = useMemo(() => {
    if (!product) return '250 g'
    const raw =
      product.quantity && product.unit
        ? `${product.quantity} ${product.unit}`
        : product.unit || '250 g'
    return raw.replace(/\.00\s*/, ' ').trim()
  }, [product])

  // Set document title and SEO meta dynamically
  useEffect(() => {
    if (cleanName) {
      document.title = `${cleanName} — Manoharam Real Foods`
    }
    return () => {
      document.title = "Manoharam Real Foods — Safe, as your mother's home."
    }
  }, [cleanName])

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
    }
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError(null)
    setIsSubmittingReview(true)
    try {
      const res = await addReview({
        productId: Number(id),
        rating: newRating,
        reviewTitle,
        reviewText,
      })
      if (res.success) {
        showToast('Review submitted! Thank you for sharing your experience.')
        setShowReviewForm(false)
        setReviewTitle('')
        setReviewText('')
        setNewRating(5)
        refetchReviews()
      } else {
        setReviewError(res.message || 'Could not submit review')
        showToast(res.message || 'Could not submit review', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not submit review')
      setReviewError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleAddToCart = async () => {
    if (product?.is_subscription_only || product?.subscription_only) {
      navigate('/subscription')
      return
    }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } })
      return
    }
    try {
      await addToCart({ productId: Number(id), quantity })
      setJustAdded(true)
      showToast(`Added ${quantity} × ${cleanName} to cart!`)
      setTimeout(() => setJustAdded(false), 1800)
    } catch (error) {
      showToast(getApiErrorMessage(error), { type: 'error' })
    }
  }

  // Reviews Data
  const reviewsList = reviewsData?.reviews ?? []
  const totalReviewsCount = Number(reviewsData?.total_reviews || reviewsList.length || 0)
  const avgRatingNum = Number(
    reviewsData?.average_rating ||
      (totalReviewsCount > 0
        ? reviewsList.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviewsCount
        : 5),
  )

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-28 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-600">Loading delicacy details…</p>
        </div>
      </AppShell>
    )
  }

  if (isError || !product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-chili-100 text-chili-600 mb-4">
            <ArrowLeft className="h-6 w-6" />
          </div>
          <p className="font-serif text-2xl font-bold text-ink-900">Product Not Found</p>
          <p className="mt-2 text-xs text-ink-500">
            This item may be temporarily out of stock or seasonal.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button variant="primary" size="md">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Menu</span>
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const isSubscriptionOnly = Boolean(product.is_subscription_only || product.subscription_only)
  const isVeg = product.is_veg !== 0 && product.is_veg !== '0' && product.is_veg !== false
  const price = Number(product.selling_price || 0)
  const hasNutrition = Object.values(product.nutrition || {}).some((v) => Number(v) > 0)
  const rawIngredients = product.ingredients || []

  // JSON-LD Product Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: cleanName,
    image: product.image_url ? [product.image_url] : undefined,
    description: product.description || 'Authentic handcrafted South Indian delicacy.',
    brand: {
      '@type': 'Brand',
      name: 'Manoharam Real Foods',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price > 0 ? price : 0,
      availability: isSubscriptionOnly
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/InStock',
    },
  }

  const quantityControl = (
    <div className="inline-flex items-center rounded-xl border border-cream-300 bg-cream-50 p-1 shadow-2xs">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={quantity <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-cream-200 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all focus-visible:outline-none"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center font-serif text-base font-bold text-ink-950 tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-700 hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <AppShell maxWidth="max-w-6xl">
      {/* Inject JSON-LD Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-10">
        {/* =========================================================================
            1. SIMPLE EDITORIAL BREADCRUMB
            ========================================================================= */}
        <nav className="flex items-center gap-1.5 text-xs text-ink-500">
          <Link to="/" className="hover:text-chili-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-ink-300 select-none" />
          <Link
            to={`/?category=${encodeURIComponent(product.category || '')}`}
            className="hover:text-chili-600 transition-colors"
          >
            {product.category || 'Menu'}
          </Link>
          <ChevronRight className="h-3 w-3 text-ink-300 select-none" />
          <span className="text-ink-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {cleanName}
          </span>
        </nav>

        {/* =========================================================================
            2. PRODUCT PRESENTATION — FOOD PHOTOGRAPHY AS THE VISUAL STAR
            ========================================================================= */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column (6 Cols): Clean, Dominant Photographic Showcase */}
          <div className="md:col-span-6 lg:col-span-6">
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square w-full overflow-hidden rounded-3xl border border-amber-900/10 bg-[#FAF4EB]/70 shadow-sm cursor-zoom-in group select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setIsLightboxOpen(true)}
              aria-label={`View enlarged photograph of ${cleanName}`}
            >
              <ProductImage
                product={product}
                alt={cleanName}
                category={product.category}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Minimal Veg Symbol */}
              <div className="absolute top-4 left-4 z-10 flex h-5 w-5 items-center justify-center rounded-[3px] border-[1.5px] border-success-600 bg-cream-50/95 shadow-2xs">
                <span className={`h-2 w-2 rounded-full ${isVeg ? 'bg-success-600' : 'bg-chili-600'}`} />
              </div>

              {/* Subtle Zoom Hint */}
              <div className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/80 backdrop-blur-xs text-ink-700 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Right Column (6 Cols): Minimal, High-Impact Product Information */}
          <div className="md:col-span-6 lg:col-span-6 space-y-6">
            <div>
              {/* Category */}
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-chili-700 block mb-1">
                {product.category || 'Traditional Recipe'}
              </span>

              {/* Product Title */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-ink-950 leading-[1.15] tracking-tight">
                {cleanName}
              </h1>

              {/* Rating & Review Count */}
              {totalReviewsCount > 0 ? (
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-600">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= Math.round(avgRatingNum)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-cream-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-ink-900 tabular-nums">
                    {avgRatingNum.toFixed(1)}
                  </span>
                  <span className="text-cream-400 select-none">·</span>
                  <a
                    href="#customer-reviews"
                    className="hover:text-chili-600 transition-colors"
                  >
                    {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'}
                  </a>
                </div>
              ) : null}

              {/* Price, Unit & Stock Availability */}
              <div className="mt-4 flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-chili-600 tabular-nums">
                  {price > 0 ? `₹${price.toFixed(0)}` : 'In Meal Plan'}
                </span>
                <span className="text-sm font-semibold text-ink-500">
                  / {cleanUnit}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isSubscriptionOnly
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isSubscriptionOnly ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}
                  />
                  <span>{isSubscriptionOnly ? 'Subscription Only' : 'In Stock'}</span>
                </span>
              </div>

              {/* Product Description */}
              {product.description ? (
                <p className="mt-4 text-sm text-ink-700 leading-relaxed font-sans max-w-lg">
                  {product.description}
                </p>
              ) : null}

              {/* Purchase Controls */}
              <div className="mt-6 pt-5 border-t border-cream-300/80">
                {isSubscriptionOnly ? (
                  <div className="space-y-2">
                    <p className="text-xs text-ink-600">
                      Prepared exclusively for our Weekly Meal & Pickle Subscription rotations.
                    </p>
                    <Link to="/subscription" className="inline-block">
                      <Button variant="primary" size="md">
                        <span>Explore Subscription Plans →</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-3.5">
                    {quantityControl}

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdding}
                      className={`button-press spring-bounce flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm sm:text-base font-bold text-cream-50 shadow-md transition-all cursor-pointer ${
                        justAdded
                          ? 'bg-emerald-600 scale-[1.01]'
                          : 'bg-chili-600 hover:bg-chili-500 shadow-chili-900/20'
                      }`}
                    >
                      {isAdding ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cream-50 border-t-transparent" />
                      ) : justAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Add to Cart — ₹{(price * quantity).toFixed(0)}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Ingredients — Simple, Visual Text List (No Numbered Cards) */}
              {rawIngredients.length > 0 ? (
                <div className="mt-6 pt-5 border-t border-cream-300/80 text-xs leading-relaxed text-ink-700">
                  <span className="font-bold text-ink-900 uppercase tracking-wider text-[11px] block mb-1">
                    Ingredients:
                  </span>
                  <p className="font-sans text-ink-600">
                    {rawIngredients.join(', ')}.
                  </p>
                </div>
              ) : null}

              {/* Nutrition — Compact Values (Reduced Visual Weight) */}
              {hasNutrition ? (
                <div className="mt-5 pt-4 border-t border-cream-300/80 text-xs">
                  <span className="font-bold text-ink-900 uppercase tracking-wider text-[11px] block mb-1.5">
                    Nutrition (per 100g):
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-600">
                    {product.nutrition.calories ? (
                      <span>
                        <strong className="text-ink-900 font-semibold">{Number(product.nutrition.calories).toFixed(0)}</strong> kcal
                      </span>
                    ) : null}
                    {product.nutrition.protein ? (
                      <span>
                        Protein: <strong className="text-ink-900 font-semibold">{Number(product.nutrition.protein).toFixed(1)}g</strong>
                      </span>
                    ) : null}
                    {product.nutrition.carbs ? (
                      <span>
                        Carbs: <strong className="text-ink-900 font-semibold">{Number(product.nutrition.carbs).toFixed(1)}g</strong>
                      </span>
                    ) : null}
                    {product.nutrition.fat ? (
                      <span>
                        Fat: <strong className="text-ink-900 font-semibold">{Number(product.nutrition.fat).toFixed(1)}g</strong>
                      </span>
                    ) : null}
                    {product.nutrition.fiber ? (
                      <span>
                        Fiber: <strong className="text-ink-900 font-semibold">{Number(product.nutrition.fiber).toFixed(1)}g</strong>
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. CUSTOMER REVIEWS — COMPACT & AUTHENTIC
            ========================================================================= */}
        <section id="customer-reviews" className="scroll-mt-24 pt-6 border-t border-cream-300 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl font-bold text-ink-950">
                Customer Reviews
              </h2>
              {totalReviewsCount > 0 ? (
                <span className="text-xs text-ink-500 font-medium">
                  ({avgRatingNum.toFixed(1)} ★ from {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              ) : null}
            </div>

            {isAuthenticated && !showReviewForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
              >
                <MessageSquarePlus className="h-4 w-4 text-chili-600" />
                <span>Write a Review</span>
              </Button>
            ) : !isAuthenticated ? (
              <Link to="/login" state={{ from: { pathname: `/product/${id}` } }}>
                <span className="text-xs font-semibold text-chili-600 hover:underline">
                  Sign in to review
                </span>
              </Link>
            ) : null}
          </div>

          {/* Write Review Form Card */}
          {showReviewForm ? (
            <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-ink-950">
                  Write Your Review
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="p-1 text-ink-400 hover:text-ink-700"
                  aria-label="Close review form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-0.5 text-amber-500 focus-visible:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-cream-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-ink-800">{newRating} Stars</span>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Review Headline (e.g. Delicious authentic flavor!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100/60 p-2.5 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                />

                <textarea
                  rows={3}
                  required
                  placeholder="Share details about the taste, texture, and aroma..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100/60 p-2.5 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                />

                {reviewError ? (
                  <p className="text-xs font-semibold text-chili-600">{reviewError}</p>
                ) : null}

                <div className="flex items-center justify-end gap-2.5 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                    disabled={isSubmittingReview}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    disabled={isSubmittingReview}
                    loading={isSubmittingReview}
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Compact Review List */}
          {reviewsList.length === 0 ? (
            <p className="text-xs text-ink-500 py-3">
              No reviews yet. Be the first to try and review this recipe!
            </p>
          ) : (
            <div className="divide-y divide-cream-300">
              {reviewsList.map((rev) => {
                const authorName = rev.reviewer_name || rev.customer_name || 'Verified Customer'
                return (
                  <div key={rev.id} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= Number(rev.rating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-cream-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-ink-900">{authorName}</span>
                        <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 text-emerald-600" /> Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-400">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {rev.review_title ? (
                      <h4 className="font-serif text-sm font-bold text-ink-950">
                        {rev.review_title}
                      </h4>
                    ) : null}

                    {rev.review_text ? (
                      <p className="text-xs text-ink-700 leading-relaxed font-sans">
                        {rev.review_text}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          4. INTERACTIVE LIGHTBOX MODAL (CLEAN IMAGE ENLARGEMENT)
          ========================================================================= */}
      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-cream-50 p-2 sm:p-3 shadow-2xl border border-cream-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 px-1">
              <span className="font-serif text-sm font-bold text-ink-900 truncate">
                {cleanName}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200"
                aria-label="Close enlarged view"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-cream-200">
              <ProductImage
                product={product}
                alt={cleanName}
                category={product.category}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* =========================================================================
          5. MOBILE STICKY PURCHASE BAR
          ========================================================================= */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3 md:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-cream-300 bg-cream-50/95 p-2.5 shadow-lg backdrop-blur-md">
          {isSubscriptionOnly ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900 truncate">{cleanName}</p>
                <p className="text-[10px] text-amber-700 font-medium">Subscription Only</p>
              </div>
              <Link to="/subscription">
                <Button variant="primary" size="sm">
                  View Plans
                </Button>
              </Link>
            </>
          ) : (
            <>
              {quantityControl}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`button-press spring-bounce flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-cream-50 transition-all ${
                  justAdded ? 'bg-emerald-600' : 'bg-chili-600 active:bg-chili-700 shadow-md'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add • ₹{(price * quantity).toFixed(0)}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
