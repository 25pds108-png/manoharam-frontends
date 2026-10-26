import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Minus, Plus, Star, MessageSquarePlus, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
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
        setReviewSuccess('Review submitted! It will appear once approved by admin.')
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
      setFeedback({ type: 'success', message: 'Added to cart' })
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) })
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Product" />
        <p className="px-4 py-12 text-center text-ink-300">Loading…</p>
      </AppShell>
    )
  }

  if (isError || !product) {
    return (
      <AppShell>
        <PageHeader title="Product" />
        <p className="px-4 py-12 text-center text-chili-500">Couldn't load this product.</p>
      </AppShell>
    )
  }

  const hasNutrition = Object.values(product.nutrition || {}).some((v) => v > 0)

  const quantityControl = (
    <div className="flex items-center gap-3 rounded-pill bg-cream-100 px-3 py-2">
      <button
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-700"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
      <button
        onClick={() => setQuantity((q) => q + 1)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-700"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )

  return (
    <AppShell>
      <PageHeader title={product.name} />

      <div className="px-4 md:flex md:gap-8">
        {/* Image — left column on desktop */}
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="aspect-square w-full rounded-card md:w-2/5 md:shrink-0"
        />

        {/* Info — right column on desktop */}
        <div className="md:flex-1">
          <div className="mt-4 flex items-start justify-between md:mt-0">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink-900 md:text-2xl">
                {product.name}
              </h2>
              <p className="text-sm text-ink-500">{product.category}</p>
            </div>
            <p className="font-display text-xl font-semibold text-chili-500 md:text-2xl">
              ₹{Number(product.selling_price).toFixed(0)}
            </p>
          </div>

          {product.description ? (
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{product.description}</p>
          ) : null}

          {/* Inline add-to-cart on desktop (no floating bar needed with room to spare) */}
          <div className="mt-5 hidden items-center gap-3 md:flex">
            {quantityControl}
            <Button onClick={handleAddToCart} loading={isAdding} className="flex-1 md:flex-none md:px-10">
              Add to cart
            </Button>
          </div>

          {feedback ? (
            <p
              className={`mt-3 text-sm font-medium md:text-left ${
                feedback.type === 'success' ? 'text-success-500' : 'text-chili-500'
              }`}
            >
              {feedback.message}
            </p>
          ) : null}

          {product.ingredients?.length > 0 ? (
            <Card className="mt-4 p-4">
              <h3 className="font-display text-base font-semibold text-ink-900">Ingredients</h3>
              <p className="mt-1 text-sm text-ink-700">{product.ingredients.join(', ')}</p>
            </Card>
          ) : null}

          {hasNutrition ? (
            <Card className="mt-4 p-4">
              <h3 className="font-display text-base font-semibold text-ink-900">Nutrition</h3>
              <dl className="mt-2 grid grid-cols-2 gap-3">
                {Object.entries(NUTRITION_LABELS).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl bg-cream-100 px-3 py-2"
                  >
                    <dt className="text-sm text-ink-500">{label}</dt>
                    <dd className="text-sm font-semibold text-ink-900">{product.nutrition[key]}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}

          {/* Reviews & Ratings Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-900">Customer Reviews</h3>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${
                          s <= Math.round(Number(reviewsData?.average_rating || 0))
                            ? 'fill-amber-400'
                            : 'text-cream-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-ink-900">
                    {Number(reviewsData?.average_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-ink-400">
                    ({reviewsData?.total_reviews || 0} {reviewsData?.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {isAuthenticated && !showReviewForm ? (
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-1.5 rounded-pill bg-cream-100 px-3.5 py-1.5 text-xs font-semibold text-chili-600 hover:bg-cream-200 transition-colors"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Write Review
                </button>
              ) : null}
            </div>

            {/* Write Review Form */}
            {showReviewForm ? (
              <Card className="mt-4 p-4 border border-chili-200 bg-cream-50/50">
                <h4 className="font-display text-sm font-semibold text-ink-900">Leave Your Rating</h4>
                <div className="mt-2 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= newRating ? 'fill-amber-400' : 'text-cream-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-ink-700">{newRating} / 5</span>
                </div>

                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Headline / Title (e.g. Authentic taste!)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white p-2.5 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    placeholder="Write your honest review here..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl border border-cream-300 bg-white p-2.5 text-xs text-ink-900 focus:border-chili-500 focus:outline-none"
                  />
                </div>

                {reviewError ? (
                  <p className="mt-2 text-xs font-medium text-chili-600">{reviewError}</p>
                ) : null}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    disabled={isSubmittingReview}
                    className="rounded-pill px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleSubmitReview}
                    loading={isSubmittingReview}
                    className="text-xs py-1.5 px-4"
                  >
                    Submit Review
                  </Button>
                </div>
              </Card>
            ) : null}

            {reviewSuccess ? (
              <p className="mt-3 rounded-xl bg-success-50 p-2.5 text-xs font-medium text-success-700">
                {reviewSuccess}
              </p>
            ) : null}

            {/* Reviews List */}
            <div className="mt-4 space-y-3">
              {(reviewsData?.reviews ?? []).length === 0 ? (
                <p className="text-xs text-ink-400 py-3 text-center bg-cream-50 rounded-xl">
                  No customer reviews yet. Be the first to share your thoughts!
                </p>
              ) : (
                (reviewsData?.reviews ?? []).map((rev) => (
                  <Card key={rev.id} className="p-3.5 space-y-1.5 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink-900">{rev.customer_name}</span>
                        <span className="flex items-center text-[10px] text-success-700 font-medium bg-success-50 px-1.5 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Verified
                        </span>
                      </div>
                      <span className="text-[11px] text-ink-300">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= rev.rating ? 'fill-amber-400' : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>

                    {rev.review_title ? (
                      <p className="text-xs font-semibold text-ink-900">{rev.review_title}</p>
                    ) : null}
                    {rev.review_text ? (
                      <p className="text-xs text-ink-600 leading-relaxed">{rev.review_text}</p>
                    ) : null}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky add-to-cart bar — mobile only */}
      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4 md:hidden">
        <Card className="flex items-center gap-3 p-3 shadow-lg shadow-ink-900/10">
          {quantityControl}
          <Button onClick={handleAddToCart} loading={isAdding} className="flex-1">
            Add to cart
          </Button>
        </Card>
      </div>
    </AppShell>
  )
}
