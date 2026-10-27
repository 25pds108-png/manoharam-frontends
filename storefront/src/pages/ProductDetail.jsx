import { useState } from 'react'
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
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ProductImage from '../components/ProductImage'
import { getProductDetails } from '../api/products'
import { getProductReviews, addReview } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState(null)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState(null)
  const [reviewSuccess, setReviewSuccess] = useState(null)

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

  const handleSubmitReview = async () => {
    setReviewError(null)
    setReviewSuccess(null)
    setIsSubmittingReview(true)
    try {
      const res = await addReview({
        productId: Number(id),
        rating: newRating,
        reviewTitle,
        reviewText,
      })
      if (res.success) {
        setReviewSuccess('Review submitted! It will appear once verified.')
        setShowReviewForm(false)
        setReviewTitle('')
        setReviewText('')
        setNewRating(5)
        refetchReviews()
      } else {
        setReviewError(res.message || 'Could not submit review')
      }
    } catch (err) {
      setReviewError(getApiErrorMessage(err, 'Could not submit review'))
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${id}` } } })
      return
    }
    setFeedback(null)
    try {
      await addToCart({ productId: Number(id), quantity })
      setFeedback({ type: 'success', message: `Added ${quantity} item(s) to your cart!` })
      setTimeout(() => setFeedback(null), 3000)
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) })
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading recipe details…</p>
        </div>
      </AppShell>
    )
  }

  if (isError || !product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-lg font-bold text-[#1C1917]">Product not found</p>
          <p className="mt-1 text-xs text-[#78716C]">This delicacy may currently be unavailable.</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#9B2C2C] px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Menu</span>
          </Link>
        </div>
      </AppShell>
    )
  }

  const price = Number(product.selling_price || 0)
  const unitText = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || ''
  const hasNutrition = Object.values(product.nutrition || {}).some((v) => Number(v) > 0)

  const quantityControl = (
    <div className="inline-flex items-center rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-1">
      <button
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#1C1917] shadow-2xs hover:bg-[#F3EBDD] active:scale-95 transition-all"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-9 text-center text-sm font-bold text-[#1C1917] tabular-nums">
        {quantity}
      </span>
      <button
        onClick={() => setQuantity((q) => q + 1)}
        className="flex h-8 w-8 items-center justify-center rounded bg-white text-[#1C1917] shadow-2xs hover:bg-[#F3EBDD] active:scale-95 transition-all"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )

  return (
    <AppShell maxWidth="max-w-7xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-[#78716C]">
          <Link to="/" className="hover:text-[#9B2C2C] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#A8A29E]" />
          <span>{product.category || 'Pickles'}</span>
          <ChevronRight className="h-3.5 w-3.5 text-[#A8A29E]" />
          <span className="font-semibold text-[#1C1917] truncate">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-12">
          {/* Left Column: Product Image */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-sm">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                className="h-full w-full rounded-xl object-cover"
              />
              <div className="absolute top-6 left-6 rounded-md bg-white/95 p-1.5 shadow-xs backdrop-blur-xs">
                <span
                  title="Vegetarian"
                  className="flex h-4 w-4 items-center justify-center rounded-[2px] border-[1.5px] border-[#15803D] bg-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col justify-between">
            <div>
              {/* Category & Tagline Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.category ? (
                  <span className="rounded-md bg-[#FCE4E4] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#9B2C2C]">
                    {product.category}
                  </span>
                ) : null}
                <span className="font-serif text-xs italic text-[#78716C]">
                  “Safe, as your mother's home.”
                </span>
              </div>

              {/* Product Title */}
              <h1 className="mt-2.5 font-serif text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              {/* Price & Unit */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#9B2C2C]">
                  ₹{price.toFixed(0)}
                </span>
                {unitText ? (
                  <span className="text-sm font-semibold text-[#78716C]">
                    / {unitText}
                  </span>
                ) : null}
                <span className="ml-2 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#15803D]">
                  In Stock & Ready
                </span>
              </div>

              {/* Description */}
              {product.description ? (
                <p className="mt-4 text-sm leading-relaxed text-[#44403C]">
                  {product.description}
                </p>
              ) : null}

              {/* Culinary Trust Highlights */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#E6D9C5] bg-[#FAF6EF] p-2.5">
                  <p className="font-serif text-xs font-bold text-[#1C1917]">Cold-Pressed</p>
                  <p className="text-[11px] text-[#78716C]">Pure sesame & groundnut</p>
                </div>
                <div className="rounded-lg border border-[#E6D9C5] bg-[#FAF6EF] p-2.5">
                  <p className="font-serif text-xs font-bold text-[#1C1917]">Small-Batch</p>
                  <p className="text-[11px] text-[#78716C]">Handcrafted in martabans</p>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-lg border border-[#E6D9C5] bg-[#FAF6EF] p-2.5">
                  <p className="font-serif text-xs font-bold text-[#1C1917]">0% Chemicals</p>
                  <p className="text-[11px] text-[#78716C]">Natural rock salt curing</p>
                </div>
              </div>

              {/* Desktop Quantity & Add to Cart */}
              <div className="mt-7 hidden items-center gap-4 sm:flex">
                {quantityControl}
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 rounded-md bg-[#9B2C2C] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#7B1F23] hover:shadow focus:ring-2 focus:ring-[#9B2C2C]/30 active:scale-95 transition-all"
                >
                  {isAdding ? 'Adding to cart…' : `Add to Cart — ₹${(price * quantity).toFixed(0)}`}
                </button>
              </div>

              {/* Instant feedback message */}
              {feedback ? (
                <div
                  className={`mt-3 rounded-lg p-3 text-xs font-semibold ${
                    feedback.type === 'success'
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#FDF2F2] text-[#9B2C2C]'
                  }`}
                >
                  {feedback.message}
                </div>
              ) : null}
            </div>

            {/* Ingredients & Nutrition Tabs/Panels */}
            <div className="mt-8 space-y-4 border-t border-[#E6D9C5] pt-6">
              {product.ingredients?.length > 0 ? (
                <div>
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1C1917]">
                    Traditional Ingredients
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-2.5 py-1 text-xs text-[#44403C]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasNutrition ? (
                <div>
                  <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1C1917]">
                    Nutritional Information
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {Object.entries(NUTRITION_LABELS).map(([key, label]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-[#E6D9C5] bg-[#FAF6EF] p-2 text-center"
                      >
                        <span className="block text-[10px] uppercase font-semibold text-[#78716C]">
                          {label}
                        </span>
                        <span className="font-bold text-xs text-[#1C1917] mt-0.5 block">
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
        <section className="mt-14 border-t border-[#E6D9C5] pt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                Customer Reviews
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex items-center text-[#D97706]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= Math.round(Number(reviewsData?.average_rating || 0))
                          ? 'fill-[#D97706]'
                          : 'text-[#E6D9C5]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#1C1917]">
                  {Number(reviewsData?.average_rating || 0).toFixed(1)} out of 5
                </span>
                <span className="text-xs text-[#78716C]">
                  ({reviewsData?.total_reviews || 0} {reviewsData?.total_reviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            {isAuthenticated && !showReviewForm ? (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#9B2C2C]/30 bg-[#FCE4E4]/60 px-4 py-2 text-xs font-bold text-[#9B2C2C] hover:bg-[#9B2C2C] hover:text-white transition-all shadow-xs"
              >
                <MessageSquarePlus className="h-3.5 w-3.5" />
                <span>Write a Review</span>
              </button>
            ) : null}
          </div>

          {/* Write Review Form */}
          {showReviewForm ? (
            <div className="mt-6 rounded-xl border border-[#9B2C2C]/30 bg-[#FFFEFC] p-5 shadow-xs">
              <h3 className="font-serif text-base font-bold text-[#1C1917]">
                Share your experience
              </h3>
              <div className="mt-3 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 text-[#D97706] hover:scale-110 transition-transform"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newRating ? 'fill-[#D97706]' : 'text-[#E6D9C5]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-[#1C1917]">{newRating} Stars</span>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Headline (e.g. Tastes just like Amma's pickle!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
                <textarea
                  rows={3}
                  placeholder="Tell us what you liked about the aroma, texture, and taste..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2.5 text-xs text-[#1C1917] outline-none focus:border-[#9B2C2C]"
                />
              </div>

              {reviewError ? (
                <p className="mt-2 text-xs font-semibold text-[#9B2C2C]">{reviewError}</p>
              ) : null}

              <div className="mt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  disabled={isSubmittingReview}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview}
                  className="rounded-md bg-[#9B2C2C] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
                >
                  {isSubmittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </div>
          ) : null}

          {reviewSuccess ? (
            <p className="mt-4 rounded-md bg-[#DCFCE7] p-3 text-xs font-semibold text-[#15803D]">
              {reviewSuccess}
            </p>
          ) : null}

          {/* Customer Reviews List */}
          <div className="mt-6 space-y-3">
            {(reviewsData?.reviews ?? []).length === 0 ? (
              <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-8 text-center">
                <p className="text-xs text-[#78716C]">
                  No verified customer reviews yet. Be the first to try and share your review!
                </p>
              </div>
            ) : (
              (reviewsData?.reviews ?? []).map((rev) => (
                <div key={rev.id} className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-4 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1C1917]">{rev.customer_name}</span>
                      <span className="flex items-center text-[10px] text-[#15803D] font-semibold bg-[#DCFCE7] px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified Purchase
                      </span>
                    </div>
                    <span className="text-[11px] text-[#A8A29E]">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-[#D97706]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3 w-3 ${
                          s <= rev.rating ? 'fill-[#D97706]' : 'text-[#E6D9C5]'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.review_title ? (
                    <p className="text-xs font-bold text-[#1C1917]">{rev.review_title}</p>
                  ) : null}
                  {rev.review_text ? (
                    <p className="text-xs text-[#44403C] leading-relaxed">{rev.review_text}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3 md:hidden">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E6D9C5] bg-[#FAF6EF]/95 p-3 shadow-lg backdrop-blur-md">
          {quantityControl}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 rounded-md bg-[#9B2C2C] py-2.5 px-4 text-xs font-bold text-white shadow-xs active:scale-95"
          >
            {isAdding ? 'Adding…' : `Add to Cart • ₹${(price * quantity).toFixed(0)}`}
          </button>
        </div>
      </div>
    </AppShell>
  )
}
