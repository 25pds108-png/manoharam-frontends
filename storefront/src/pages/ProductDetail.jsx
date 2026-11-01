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
  ShieldCheck,
  Droplets,
  Flame,
  Maximize2,
  X,
  ShoppingBag,
  Truck,
  Leaf,
  Clock,
  Share2,
  Check,
  Package,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ProductImage from '../components/ProductImage'
import Button from '../components/ui/Button'
import { HeritageKolamDivider } from '../components/ui/HeritagePattern'
import { getProductDetails } from '../api/products'
import { getProductReviews, addReview } from '../api/reviews'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { getApiErrorMessage } from '../api/client'
import { resolveImageUrl } from '../lib/imageHelper'

const NUTRITION_LABELS = {
  calories: { label: 'Energy', unit: 'kcal' },
  protein: { label: 'Protein', unit: 'g' },
  carbs: { label: 'Carbohydrates', unit: 'g' },
  fat: { label: 'Healthy Fats', unit: 'g' },
  fiber: { label: 'Dietary Fiber', unit: 'g' },
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addToCart, isAdding } = useCart()
  const { showToast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL')

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
    const raw = product.quantity && product.unit ? `${product.quantity} ${product.unit}` : product.unit || '250 g'
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
        showToast('Review submitted! It will appear once verified by our kitchen team.')
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
      showToast(`Added ${quantity} × ${cleanName} to kitchen cart!`)
      setTimeout(() => setJustAdded(false), 2000)
    } catch (error) {
      showToast(getApiErrorMessage(error), { type: 'error' })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cleanName} — Manoharam Real Foods`,
          text: `Check out ${cleanName} from Manoharam Real Foods. Handcrafted with cold-pressed oils.`,
          url: window.location.href,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast('Recipe link copied to clipboard!')
    } catch {
      showToast('Could not copy link', { type: 'error' })
    }
  }

  // Reviews and Rating Calculations
  const reviewsList = reviewsData?.reviews ?? []
  const totalReviewsCount = Number(reviewsData?.total_reviews || reviewsList.length || 0)
  const avgRatingNum = Number(
    reviewsData?.average_rating ||
      (totalReviewsCount > 0
        ? reviewsList.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviewsCount
        : 5),
  )

  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviewsList.forEach((r) => {
      const s = Math.round(Number(r.rating || 5))
      if (counts[s] !== undefined) counts[s] += 1
    })
    return counts
  }, [reviewsList])

  const filteredReviews = useMemo(() => {
    if (selectedRatingFilter === 'ALL') return reviewsList
    return reviewsList.filter((r) => Math.round(Number(r.rating || 5)) === Number(selectedRatingFilter))
  }, [reviewsList, selectedRatingFilter])

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl px-4 py-28 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-5 font-serif text-base font-semibold text-ink-800">
            Retrieving authentic recipe details…
          </p>
          <p className="text-xs text-ink-500 mt-1">Slow-simmered culinary traditions from our kitchen.</p>
        </div>
      </AppShell>
    )
  }

  if (isError || !product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-chili-100/80 border border-chili-200 text-chili-600 mb-5 shadow-sm">
            <ArrowLeft className="h-7 w-7" />
          </div>
          <p className="font-serif text-3xl font-bold text-ink-900">Delicacy Not Found</p>
          <p className="mt-2.5 text-xs sm:text-sm text-ink-600 leading-relaxed">
            This traditional preparation may currently be seasonal or slow-simmering in our kitchen.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button variant="primary" size="md">
              <ArrowLeft className="h-4 w-4" />
              <span>Explore Delicacy Menu</span>
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
    description:
      product.description ||
      'Authentic handcrafted South Indian delicacy made with cold-pressed oils and zero preservatives.',
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
    <div className="inline-flex items-center rounded-xl border border-amber-900/15 bg-cream-50/90 p-1 shadow-2xs">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        disabled={quantity <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-100 text-ink-900 hover:bg-cream-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-12 text-center font-serif text-base font-bold text-ink-950 tabular-nums">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-cream-100 text-ink-900 hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-500"
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

      <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-12">
        {/* =========================================================================
            1. REFINED EDITORIAL BREADCRUMB & UTILITY HEADER
            ========================================================================= */}
        <nav className="flex items-center justify-between text-xs text-ink-500 border-b border-amber-900/10 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-chili-600 transition-colors font-medium">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-ink-400 select-none" />
            <Link
              to={`/?category=${encodeURIComponent(product.category || 'Pickles')}`}
              className="hover:text-chili-600 transition-colors font-medium"
            >
              {product.category || 'Kitchen Delicacies'}
            </Link>
            <ChevronRight className="h-3 w-3 text-ink-400 select-none" />
            <span className="font-semibold text-ink-900 truncate max-w-[200px] sm:max-w-md">
              {cleanName}
            </span>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-900/15 bg-cream-50/80 px-2.5 py-1 text-ink-600 hover:bg-cream-100 hover:text-ink-900 transition-all text-[11px] font-medium"
            title="Share this recipe"
          >
            <Share2 className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </nav>

        {/* =========================================================================
            2. MAIN PRODUCT PRESENTATION — PHOTOGRAPHIC STAGE & EDITORIAL LOCKUP
            ========================================================================= */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 items-start">
          {/* Left Column (5 Cols): The Photographic Showcase Stage */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.25rem] bg-gradient-to-b from-[#FAF4EB] via-[#F6EFE5] to-[#FAF4EB] p-4 sm:p-6 border border-amber-900/15 shadow-md group">
              {/* Subtle background Kolam paper grain */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none select-none rounded-[2.25rem]"
                style={{
                  backgroundImage: 'radial-gradient(#9B2C2C 0.75px, transparent 0.75px)',
                  backgroundSize: '18px 18px',
                }}
              />

              {/* Photographic Canvas with Hover Zoom */}
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 border-cream-50/90 shadow-md bg-cream-200/50 cursor-zoom-in relative z-10"
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

                {/* Subtle warm culinary gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent pointer-events-none" />

                {/* Top-Left: Dietary Vegetarian Emblem */}
                <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-cream-50/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-success-700 border border-cream-200 shadow-2xs">
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] ${
                      isVeg ? 'border-success-600 bg-cream-50' : 'border-chili-600 bg-cream-50'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isVeg ? 'bg-success-600' : 'bg-chili-600'}`}
                    />
                  </span>
                  <span>{isVeg ? '100% Vegetarian' : 'Non-Veg'}</span>
                </div>

                {/* Top-Right: Zoom Lightbox Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsLightboxOpen(true)
                  }}
                  className="absolute top-3.5 right-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream-50/90 backdrop-blur-md text-ink-700 hover:bg-cream-50 hover:text-ink-950 border border-cream-200 shadow-2xs transition-transform group-hover:scale-105"
                  title="Enlarge photograph"
                  aria-label="Enlarge image"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>

                {/* Bottom Photographic Caption Tag */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between text-[11px] font-medium text-cream-100">
                  <span className="backdrop-blur-xs bg-ink-950/60 px-2.5 py-1 rounded-md border border-cream-100/15">
                    Small-Batch Bottled at Dawn
                  </span>
                  <span className="font-serif italic text-amber-300 text-xs">
                    100% Cold-Pressed
                  </span>
                </div>
              </div>

              {/* Integrated Purity & Craft Benchmark Bar (Under Image Stage) */}
              <div className="mt-4 pt-3 border-t border-amber-900/10 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-ink-700 relative z-10">
                <div className="flex flex-col items-center gap-1 p-1">
                  <Droplets className="h-4 w-4 text-chili-600 shrink-0" />
                  <span className="font-bold leading-tight">Chekku Oils</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-1 border-x border-amber-900/10">
                  <Flame className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="font-bold leading-tight">Sun-Cured Spices</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-bold leading-tight">0 Preservatives</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Editorial Hierarchy, Dynamic Pricing, and Unified Purchase Stage */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              {/* Category Eyebrow & Brand Motto */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full border border-chili-600/30 bg-chili-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-chili-700 shadow-2xs">
                  <span>{product.category || 'Traditional Recipe'}</span>
                </span>
                <span className="text-amber-800/40 select-none">•</span>
                <span className="font-serif italic text-xs sm:text-sm text-chili-700 font-medium">
                  “Safe, as your mother&apos;s home.”
                </span>
              </div>

              {/* Product Headline */}
              <h1 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-ink-950 leading-[1.12] tracking-tight">
                {cleanName}
              </h1>

              {/* Rating & Review Jump Bar */}
              <div className="mt-2.5 flex items-center gap-2.5 text-xs text-ink-600">
                <div className="flex items-center text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
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
                <span className="text-amber-800/30 select-none">•</span>
                <a
                  href="#customer-reviews"
                  className="hover:text-chili-600 transition-colors underline decoration-cream-300 underline-offset-4"
                >
                  {totalReviewsCount} verified {totalReviewsCount === 1 ? 'review' : 'reviews'}
                </a>
              </div>

              {/* Price & Packaging Presentation */}
              <div className="mt-5 flex items-baseline gap-3 flex-wrap">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-chili-600 tabular-nums">
                  {price > 0 ? `₹${price.toFixed(0)}` : 'In Meal Plan'}
                </span>
                <span className="text-sm sm:text-base font-semibold text-ink-500">
                  / {cleanUnit}
                </span>

                {/* Availability Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border shadow-2xs ${
                    isSubscriptionOnly
                      ? 'border-amber-300/80 bg-amber-50 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSubscriptionOnly ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span>
                    {isSubscriptionOnly
                      ? 'Exclusive to Subscription Plans'
                      : 'In Stock · Freshly Bottled'}
                  </span>
                </span>
              </div>

              {/* Product Narrative Description */}
              {product.description ? (
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-700 font-sans max-w-xl">
                  {product.description}
                </p>
              ) : null}

              {/* Connected Purchase Stage */}
              <div className="mt-7 pt-6 border-t border-amber-900/10">
                {isSubscriptionOnly ? (
                  <div className="rounded-2xl border border-amber-900/15 bg-gradient-to-br from-[#FAF5ED] to-[#F5EFE6] p-5 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>Subscription Exclusive Recipe</span>
                    </div>
                    <p className="text-xs sm:text-sm font-normal text-ink-700 leading-relaxed font-sans">
                      This artisanal preparation is crafted exclusively for our Weekly Meal & Pickle
                      Subscription rotations. Enjoy scheduled home deliveries fresh at dawn.
                    </p>
                    <Link to="/subscription" className="inline-block pt-1">
                      <Button variant="primary" size="md">
                        <span>Explore Subscription Plans →</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Connected Stepper */}
                      {quantityControl}

                      {/* Prominent Chili-Red Add to Cart CTA */}
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className={`button-press spring-bounce flex-1 min-w-[220px] inline-flex items-center justify-center gap-2.5 rounded-xl px-8 py-3.5 text-sm sm:text-base font-bold text-cream-50 shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer ${
                          justAdded
                            ? 'bg-emerald-600 shadow-emerald-900/20 scale-[1.02]'
                            : 'bg-chili-600 hover:bg-chili-500 shadow-chili-900/25 hover:shadow-lg'
                        }`}
                      >
                        {isAdding ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cream-50 border-t-transparent" />
                        ) : justAdded ? (
                          <>
                            <Check className="h-5 w-5" />
                            <span>Added to Kitchen Basket!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-5 w-5" />
                            <span>Add to Cart — ₹{(price * quantity).toFixed(0)}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Micro-Reassurance Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-600 font-medium pt-1">
                      <span className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5 text-amber-600" /> Free Morning Delivery on plans
                      </span>
                      <span className="text-cream-400 select-none">•</span>
                      <span className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-amber-600" /> Food-Grade Glass & Ceramic Jar
                      </span>
                      <span className="text-cream-400 select-none">•</span>
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Zero Chemical Vinegar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =========================================================================
                3. ARTISANAL INGREDIENTS EXPERIENCE (NO GENERIC TAGS)
                ========================================================================= */}
            <div className="border-t border-amber-900/10 pt-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 block">
                    Pristine Kitchen Ingredients
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink-950 mt-0.5">
                    Hand-Selected Traditional Recipe
                  </h3>
                </div>
                <Leaf className="h-5 w-5 text-emerald-600 opacity-80" />
              </div>

              {rawIngredients.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {rawIngredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 rounded-xl border border-amber-900/12 bg-[#FAF5ED] p-2.5 sm:p-3 shadow-2xs hover:border-amber-900/25 transition-colors"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream-50 border border-amber-900/15 text-[10px] font-bold text-amber-800">
                        0{i + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-ink-900 truncate">
                        {ing}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-sans bg-[#FAF5ED] p-4 rounded-xl border border-amber-900/10">
                  Crafted using 100% farm-fresh regional produce, wood-pressed gingelly oil, and
                  sun-roasted spices without any artificial chemicals or synthetic vinegars.
                </p>
              )}
            </div>

            {/* =========================================================================
                4. STRUCTURED NUTRITIONAL PROFILE (PANEL LAYOUT — NO BOXES)
                ========================================================================= */}
            {hasNutrition ? (
              <div className="border-t border-amber-900/10 pt-7 space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 block">
                    Nutritional Overview
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink-950 mt-0.5">
                    Wholesome Natural Nutrition
                  </h3>
                  <p className="text-[11px] text-ink-500 font-medium">
                    Calculated per typical serving · 100% natural cold-pressed oil base
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-900/12 bg-[#FAF4EB]/80 p-4 sm:p-5 shadow-2xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-900/10 text-center">
                    {Object.entries(NUTRITION_LABELS).map(([key, meta], idx) => {
                      const val = product.nutrition[key]
                      return (
                        <div key={key} className={idx > 0 ? 'pt-2 sm:pt-0 sm:pl-2' : ''}>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-ink-500">
                            {meta.label}
                          </span>
                          <span className="font-serif text-base sm:text-lg font-bold text-ink-950 mt-1 block tabular-nums">
                            {val ? Number(val).toFixed(1) : '—'}{' '}
                            <span className="text-[11px] font-sans font-medium text-ink-500">
                              {meta.unit}
                            </span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-[10px] text-ink-500 text-center mt-3 pt-3 border-t border-amber-900/10">
                    Naturally preserved with rock salt and cold-pressed oil. Zero trans fats, zero refined sugars, zero artificial colors.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* =========================================================================
            5. THE CRAFT BEHIND THE RECIPE — DISTINCTIVE EDITORIAL PRODUCT STORY
            ========================================================================= */}
        <section className="rounded-[2.5rem] border border-amber-900/12 bg-gradient-to-b from-[#FAF4EB] via-[#F8F2E6] to-[#FAF4EB] p-8 sm:p-12 lg:p-14 shadow-sm relative overflow-hidden">
          {/* Subtle background Kolam watermark */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none select-none"
            style={{
              backgroundImage: 'radial-gradient(#9B2C2C 0.75px, transparent 0.75px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-800 block">
              The Soul of This Recipe
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-950 tracking-tight leading-tight">
              Purity You Can Trust. Tradition You Can Taste.
            </h2>
            <div className="flex justify-center opacity-60 my-2">
              <HeritageKolamDivider className="max-w-xs text-amber-800/40" />
            </div>
            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans max-w-xl mx-auto">
              Every batch honors centuries of South Indian culinary heritage. Prepared in small artisanal
              runs so you experience authentic aroma, rich texture, and genuine warmth.
            </p>
          </div>

          <div className="relative z-10 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-2 p-5 rounded-2xl bg-cream-50/70 border border-amber-900/10 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100/80 text-amber-800 font-serif font-bold text-base mb-3">
                01
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink-900">
                Stone-Pounded & Sun-Cured
              </h4>
              <p className="text-xs text-ink-600 leading-relaxed font-sans">
                Whole spices and chillies are slow-cured under the tropical dawn sun and pounded on
                traditional granite stones to preserve volatile aromatic oils.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-cream-50/70 border border-amber-900/10 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chili-100/80 text-chili-800 font-serif font-bold text-base mb-3">
                02
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink-900">
                100% Cold-Pressed Chekku Oil
              </h4>
              <p className="text-xs text-ink-600 leading-relaxed font-sans">
                Immersed exclusively in pure native sesame and groundnut oils extracted without
                frictional heat, retaining natural antioxidants and golden live flavor.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-cream-50/70 border border-amber-900/10 shadow-2xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-800 font-serif font-bold text-base mb-3">
                03
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink-900">
                Traditional Storage & Pairing
              </h4>
              <p className="text-xs text-ink-600 leading-relaxed font-sans">
                Bottled in food-safe airtight jars. Store in a cool pantry and use a dry wooden spoon.
                Pairs exquisitely with hot Ponni rice & cow ghee, curd rice, dosas, and parathas.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. CUSTOMER REVIEWS & STAR RATINGS (COMPLETELY REDESIGNED)
            ========================================================================= */}
        <section id="customer-reviews" className="scroll-mt-24 space-y-8">
          {/* Review Summary Hero Header */}
          <div className="rounded-[2rem] border border-amber-900/15 bg-gradient-to-r from-[#FAF4EB] via-[#F6EFE5] to-[#FAF4EB] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column (5 Cols): Big Score & Stars */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-800 block">
                  Community Feedback
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950">
                  Customer Reviews
                </h2>
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="font-serif text-4xl sm:text-5xl font-extrabold text-ink-950 tabular-nums">
                    {avgRatingNum.toFixed(1)}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= Math.round(avgRatingNum)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-cream-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-ink-600 font-medium block">
                      Based on {totalReviewsCount} verified {totalReviewsCount === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Column (4 Cols): Rating Breakdown Progress Bars */}
              <div className="md:col-span-4 space-y-1.5 border-t md:border-t-0 md:border-l border-amber-900/10 md:pl-6 pt-4 md:pt-0">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars] || 0
                  const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-ink-600">
                      <span className="w-6 font-semibold tabular-nums text-right">{stars}★</span>
                      <div className="flex-1 h-2 rounded-full bg-cream-200 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-[11px] text-ink-400 tabular-nums text-right">
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Right Column (3 Cols): Write a Review Action */}
              <div className="md:col-span-3 flex flex-col sm:items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-amber-900/10 md:pl-6 pt-4 md:pt-0">
                {isAuthenticated && !showReviewForm ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setShowReviewForm(true)}
                    className="w-full sm:w-auto"
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>Write a Review</span>
                  </Button>
                ) : !isAuthenticated ? (
                  <Link to="/login" state={{ from: { pathname: `/product/${id}` } }}>
                    <Button variant="outline" size="sm">
                      <span>Sign in to Review</span>
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Write Review Form Card (Accordion / Modal) */}
          {showReviewForm ? (
            <div className="rounded-2xl border border-amber-900/15 bg-cream-50 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-ink-950">
                    Share your culinary tasting experience
                  </h3>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Your verified feedback helps our traditional kitchen maintain authentic standards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="p-1 text-ink-400 hover:text-ink-700 rounded-lg"
                  aria-label="Close review form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-ink-700">Your Rating:</span>
                <div className="flex items-center gap-1">
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
                </div>
                <span className="ml-2 font-serif text-sm font-bold text-ink-900">{newRating} of 5 Stars</span>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-3.5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delicious authentic flavor, just like Amma's pickle!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-xl border border-amber-900/15 bg-cream-100/60 p-3 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    Your Tasting Experience
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe the aroma, spice balance, texture, and how you enjoyed it with hot rice or breakfast..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl border border-amber-900/15 bg-cream-100/60 p-3 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:ring-1 focus:ring-chili-500"
                  />
                </div>

                {reviewError ? (
                  <p className="text-xs font-semibold text-chili-600 bg-chili-50 p-2.5 rounded-lg border border-chili-200">
                    {reviewError}
                  </p>
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
                    type="submit"
                    disabled={isSubmittingReview}
                    loading={isSubmittingReview}
                  >
                    Publish Verified Review
                  </Button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Filter Pills */}
          {totalReviewsCount > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRatingFilter('ALL')}
                className={`rounded-full px-3.5 py-1.5 font-bold transition-all ${
                  selectedRatingFilter === 'ALL'
                    ? 'bg-chili-600 text-cream-50 shadow-xs'
                    : 'bg-cream-50 text-ink-600 border border-amber-900/12 hover:bg-cream-100'
                }`}
              >
                All ({totalReviewsCount})
              </button>
              {[5, 4, 3, 2, 1].map((s) => {
                const count = ratingDistribution[s] || 0
                if (count === 0 && selectedRatingFilter !== String(s)) return null
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedRatingFilter(String(s))}
                    className={`rounded-full px-3.5 py-1.5 font-bold transition-all flex items-center gap-1 ${
                      selectedRatingFilter === String(s)
                        ? 'bg-chili-600 text-cream-50 shadow-xs'
                        : 'bg-cream-50 text-ink-600 border border-amber-900/12 hover:bg-cream-100'
                    }`}
                  >
                    <span>{s}★</span>
                    <span className="opacity-80">({count})</span>
                  </button>
                )
              })}
            </div>
          ) : null}

          {/* Customer Reviews Grid (Refined 2-Column Desktop, Compact Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredReviews.length === 0 ? (
              <div className="md:col-span-2 rounded-2xl border border-amber-900/12 bg-cream-50 p-8 text-center space-y-2">
                <p className="font-serif text-base font-bold text-ink-900">
                  No verified reviews match your filter.
                </p>
                <p className="text-xs text-ink-500">
                  Try switching back to all reviews or be the first to share your tasting notes!
                </p>
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const authorName = rev.reviewer_name || rev.customer_name || 'Verified Customer'
                const initial = authorName.charAt(0).toUpperCase()
                return (
                  <div
                    key={rev.id}
                    className="rounded-2xl border border-amber-900/12 bg-cream-50 p-5 sm:p-6 shadow-xs hover:border-amber-900/25 transition-all duration-300 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      {/* Reviewer Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-serif font-bold text-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-ink-950 block leading-tight">
                              {authorName}
                            </span>
                            <span className="inline-flex items-center text-[10px] text-emerald-700 font-semibold mt-0.5">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> Verified Purchase
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-ink-400 font-medium">
                          {new Date(rev.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${
                              s <= Number(rev.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-cream-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Title & Body */}
                      {rev.review_title ? (
                        <h4 className="font-serif text-sm sm:text-base font-bold text-ink-950 leading-snug">
                          {rev.review_title}
                        </h4>
                      ) : null}

                      {rev.review_text ? (
                        <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans">
                          {rev.review_text}
                        </p>
                      ) : null}
                    </div>

                    <div className="pt-2 text-[10px] text-ink-400 font-medium border-t border-amber-900/5">
                      Batch-Tested Purity Verified
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* =========================================================================
          7. INTERACTIVE LIGHTBOX MODAL (HIGH-RES PHOTOGRAPHIC ENLARGEMENT)
          ========================================================================= */}
      {isLightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-cream-50 p-3 sm:p-4 shadow-2xl border border-cream-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-cream-200">
              <span className="font-serif text-base font-bold text-ink-950">
                {cleanName}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-cream-100 text-ink-700 hover:bg-cream-200 transition-colors"
                aria-label="Close enlarged view"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-200 mt-2">
              <ProductImage
                product={product}
                alt={cleanName}
                category={product.category}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="pt-3 px-2 flex items-center justify-between text-xs text-ink-500">
              <span>Authentic Manoharam Real Foods Delicacy</span>
              <span className="font-serif italic text-amber-700">100% Traditional Preparation</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* =========================================================================
          8. MOBILE STICKY PURCHASE BAR (DOCK FLOATING BAR)
          ========================================================================= */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3 md:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-900/15 bg-cream-50/95 p-3 shadow-xl backdrop-blur-md">
          {isSubscriptionOnly ? (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink-900 truncate">{cleanName}</p>
                <p className="text-[11px] text-amber-700 font-medium">Subscription Exclusive</p>
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
                  justAdded
                    ? 'bg-emerald-600'
                    : 'bg-chili-600 hover:bg-chili-500 shadow-md shadow-chili-900/20'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
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
