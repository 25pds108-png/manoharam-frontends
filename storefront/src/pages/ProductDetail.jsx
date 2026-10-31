import { useState, useEffect } from 'react'
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
  ShieldCheck,
  Droplets,
  Flame,
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

const NUTRITION_LABELS = {
  calories: 'Calories',
  protein: 'Protein (g)',
  carbs: 'Carbs (g)',
  fat: 'Fat (g)',
  fiber: 'Fiber (g)',
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, isAdding } = useCart()
  const { showToast } = useToast()
  const [quantity, setQuantity] = useState(1)

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

  // Set document title and SEO meta dynamically
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} — Manoharam Real Foods`
    }
    return () => {
      document.title = "Manoharam Real Foods — Safe, as your mother's home."
    }
  }, [product?.name])

  const handleSubmitReview = async () => {
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
        showToast('Review submitted! It will appear once verified by our team.')
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
      showToast(`Added ${quantity} ${product.name} to cart!`)
    } catch (error) {
      showToast(getApiErrorMessage(error), { type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Retrieving authentic recipe details…</p>
        </div>
      </AppShell>
    )
  }

  if (isError || !product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-chili-100 text-chili-600 mb-4">
            <ArrowLeft className="h-6 w-6" />
          </div>
          <p className="font-serif text-2xl font-bold text-ink-900">Delicacy Not Found</p>
          <p className="mt-2 text-xs text-ink-500">This culinary preparation may currently be out of stock or seasonal.</p>
          <Link to="/" className="mt-6 inline-block">
            <Button variant="primary" size="md">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Menu</span>
            </Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const isSubscriptionOnly = Boolean(product.is_subscription_only || product.subscription_only)
  const isVeg = product.is_veg !== 0 && product.is_veg !== '0' && product.is_veg !== false
  const price = Number(product.selling_price || 0)
  const unitText = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || ''
  const hasNutrition = Object.values(product.nutrition || {}).some((v) => Number(v) > 0)

  // JSON-LD Product Schema for SEO
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : undefined,
    description: product.description || 'Authentic handcrafted South Indian delicacy made with cold-pressed oils and zero preservatives.',
    brand: {
      '@type': 'Brand',
      name: 'Manoharam Real Foods',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: price > 0 ? price : 0,
      availability: isSubscriptionOnly ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    },
  }

  const quantityControl = (
    <div className="inline-flex items-center rounded-xl border border-cream-300 bg-cream-50 p-1 shadow-xs">
      <button
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-ink-900 shadow-2xs hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center text-sm font-bold text-ink-900 tabular-nums">
        {quantity}
      </span>
      <button
        onClick={() => setQuantity((q) => q + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-ink-900 shadow-2xs hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )

  return (
    <AppShell maxWidth="max-w-7xl">
      {/* Inject JSON-LD Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb navigation */}
        <nav className="flex items-center gap-2 text-xs text-ink-500">
          <Link to="/" className="hover:text-chili-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
          <span>{product.category || 'Food'}</span>
          <ChevronRight className="h-3.5 w-3.5 text-ink-300" />
          <span className="font-semibold text-ink-900 truncate">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12">
          {/* Left Column: Product Image Card */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 p-4 shadow-sm group">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                className="h-full w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-6 left-6 rounded-lg bg-cream-50/95 p-1.5 shadow-xs backdrop-blur-xs">
                <span
                  title={isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
                  className={`flex h-4.5 w-4.5 items-center justify-center rounded-[2px] border-[1.5px] bg-cream-50 ${
                    isVeg ? 'border-success-500' : 'border-chili-600'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isVeg ? 'bg-success-500' : 'bg-chili-600'
                    }`}
                  />
                </span>
              </div>
            </div>

            {/* Purity Badges Row */}
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-[11px] text-ink-700">
              <div className="rounded-xl border border-cream-300 bg-cream-50 p-2.5">
                <Droplets className="h-4 w-4 text-chili-600 mx-auto mb-1" />
                <span className="font-semibold block">Cold-Pressed Oils</span>
              </div>
              <div className="rounded-xl border border-cream-300 bg-cream-50 p-2.5">
                <Flame className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                <span className="font-semibold block">Small Batches</span>
              </div>
              <div className="rounded-xl border border-cream-300 bg-cream-50 p-2.5">
                <ShieldCheck className="h-4 w-4 text-success-500 mx-auto mb-1" />
                <span className="font-semibold block">0 Preservatives</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Tagline Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category ? (
                  <span className="rounded-md bg-chili-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-chili-600">
                    {product.category}
                  </span>
                ) : null}
                {isSubscriptionOnly ? (
                  <span className="rounded-md bg-amber-500 px-3 py-1 text-xs font-bold text-cream-50 shadow-xs">
                    Subscription Only
                  </span>
                ) : null}
                <span className="font-serif text-xs italic text-chili-600 font-semibold">
                  “Safe, as your mother's home.”
                </span>
              </div>

              {/* Product Title */}
              <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {/* Price & Unit */}
              <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-chili-600 tabular-nums">
                  {price > 0 ? `₹${price.toFixed(0)}` : 'In Subscription Plan'}
                </span>
                {unitText ? (
                  <span className="text-sm font-semibold text-ink-500">
                    / {unitText}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isSubscriptionOnly
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-success-100 text-success-500'
                  }`}
                >
                  {isSubscriptionOnly ? 'Available via Subscription' : 'In Stock & Ready'}
                </span>
              </div>

              {/* Description */}
              {product.description ? (
                <p className="mt-4 text-sm leading-relaxed text-ink-700 font-sans">
                  {product.description}
                </p>
              ) : null}

              {/* Desktop Quantity & Add to Cart or Subscription CTA */}
              {isSubscriptionOnly ? (
                <div className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-xs space-y-3">
                  <p className="text-xs font-medium text-ink-700 leading-relaxed">
                    This recipe is prepared exclusively for our Meal & Pickle Subscription Plans. Enjoy regular, scheduled home deliveries without placing individual orders each time.
                  </p>
                  <Link to="/subscription" className="inline-block">
                    <Button variant="primary" size="md">
                      <span>Explore Subscription Plans</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-8 hidden items-center gap-4 sm:flex">
                  {quantityControl}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    loading={isAdding}
                    className="flex-1"
                  >
                    <span>Add to Cart — ₹{(price * quantity).toFixed(0)}</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Ingredients & Nutrition Tabs/Panels */}
            <div className="space-y-5 border-t border-cream-300 pt-6">
              {product.ingredients?.length > 0 ? (
                <div>
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-900">
                    Traditional Ingredients
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="rounded-lg border border-cream-300 bg-cream-50 px-3 py-1 text-xs font-medium text-ink-700 shadow-2xs"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasNutrition ? (
                <div>
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-ink-900">
                    Nutritional Information
                  </h3>
                  <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {Object.entries(NUTRITION_LABELS).map(([key, label]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-cream-300 bg-cream-50 p-2.5 text-center shadow-2xs"
                      >
                        <span className="block text-[10px] uppercase font-semibold text-ink-500">
                          {label}
                        </span>
                        <span className="font-bold text-xs text-ink-900 mt-0.5 block tabular-nums">
                          {product.nutrition[key] || '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* =========================================================================
            CUSTOMER REVIEWS & STAR RATINGS
            ========================================================================= */}
        <section className="mt-16 border-t border-cream-300 pt-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-ink-900">
                Customer Reviews
              </h2>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(Number(reviewsData?.average_rating || 0))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-cream-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-ink-900 tabular-nums">
                  {Number(reviewsData?.average_rating || 0).toFixed(1)} out of 5
                </span>
                <span className="text-xs text-ink-500">
                  ({reviewsData?.total_reviews || 0} {reviewsData?.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
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
            ) : null}
          </div>

          {/* Write Review Form */}
          {showReviewForm ? (
            <div className="rounded-2xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-ink-900">
                Share your tasting experience
              </h3>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform focus-visible:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-cream-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-ink-900">{newRating} Stars</span>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Headline (e.g. Tastes just like Amma's pickle!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100 p-3 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                />
                <textarea
                  rows={3}
                  placeholder="Tell us what you liked about the aroma, texture, and taste..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full rounded-xl border border-cream-300 bg-cream-100 p-3 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                />
              </div>

              {reviewError ? (
                <p className="text-xs font-semibold text-chili-600">{reviewError}</p>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  loading={isSubmittingReview}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          ) : null}

          {/* Customer Reviews List */}
          <div className="space-y-3">
            {(reviewsData?.reviews ?? []).length === 0 ? (
              <div className="rounded-2xl border border-cream-300 bg-cream-50 p-8 text-center">
                <p className="text-xs text-ink-500">
                  No verified customer reviews yet. Be the first to try and share your review!
                </p>
              </div>
            ) : (
              (reviewsData?.reviews ?? []).map((rev) => (
                <div key={rev.id} className="rounded-2xl border border-cream-300 bg-cream-50 p-4 sm:p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-ink-900">{rev.customer_name}</span>
                      <span className="flex items-center text-[10px] text-success-500 font-semibold bg-success-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified Purchase
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

                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-cream-300'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.review_title ? (
                    <p className="text-xs sm:text-sm font-bold text-ink-900">{rev.review_title}</p>
                  ) : null}
                  {rev.review_text ? (
                    <p className="text-xs text-ink-700 leading-relaxed font-sans">{rev.review_text}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3 md:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-cream-300 bg-cream-100/95 p-3 shadow-lg backdrop-blur-md">
          {isSubscriptionOnly ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900 truncate">{product.name}</p>
                <p className="text-[11px] text-ink-500">Available via subscription</p>
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
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={isAdding}
                loading={isAdding}
                className="flex-1"
              >
                Add • ₹{(price * quantity).toFixed(0)}
              </Button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
