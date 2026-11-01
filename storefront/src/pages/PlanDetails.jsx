import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Clock,
  Check,
  Sparkles,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Utensils,
  Leaf,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import ProductImage from '../components/ProductImage'
import Button from '../components/ui/Button'
import { getPlanDetails } from '../api/subscriptions'
import { getPlanDietaryType } from '../lib/planDietaryType'
import { useAuth } from '../context/AuthContext'

/**
 * Strips development prefixes like [Test] or [Verify] in customer-facing display.
 */
function cleanText(text) {
  if (!text) return ''
  return text.replace(/^\[(Test|Verify)\]\s*/i, '').trim()
}

/**
 * Traditional Indian vegetarian / non-vegetarian dietary mark.
 */
function DietaryMark({ isVeg = true, showLabel = true }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-cream-50/95 px-3 py-1 shadow-xs border border-cream-300/80 backdrop-blur-md select-none`}
      title={isVeg ? '100% Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[2px] border-[1.5px] bg-white shrink-0 ${
          isVeg ? 'border-success-500' : 'border-chili-600'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isVeg ? 'bg-success-500' : 'bg-chili-600'
          }`}
        />
      </span>
      {showLabel ? (
        <span
          className={`text-[11px] font-bold uppercase tracking-wider ${
            isVeg ? 'text-success-700' : 'text-chili-700'
          }`}
        >
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      ) : null}
    </span>
  )
}

const DURATION_CYCLES = [
  { weeks: 1, label: '1 Week', subtitle: '7-Day Rotation' },
  { weeks: 2, label: '2 Weeks', subtitle: '14-Day Delivery' },
  { weeks: 3, label: '3 Weeks', subtitle: '21-Day Delivery' },
  { weeks: 4, label: '4 Weeks', subtitle: 'Monthly Cycle', badge: 'Best Value' },
]

export default function PlanDetails() {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscription', 'plan-details', planId],
    queryFn: () => getPlanDetails(planId),
  })

  const plan = data?.plan
  const products = data?.products ?? []
  const dietaryType = plan ? getPlanDietaryType(plan) : 'VEG'
  const isVeg = dietaryType === 'VEG'

  const cleanPlanName = useMemo(() => {
    if (!plan?.name) return 'South Indian Meal Subscription'
    return cleanText(plan.name)
  }, [plan?.name])

  // Dynamic image management: default to plan's master image, with fallback to first product
  const defaultImage = useMemo(() => {
    return plan?.image_url || plan?.image || products[0]?.image_url || ''
  }, [plan, products])

  const [activePhoto, setActivePhoto] = useState(null)
  const [selectedWeeks, setSelectedWeeks] = useState(1)

  // Sync active photo whenever the plan changes
  useEffect(() => {
    if (defaultImage) {
      setActivePhoto(defaultImage)
    }
  }, [defaultImage])

  // Update dynamic SEO title
  useEffect(() => {
    if (cleanPlanName) {
      document.title = `${cleanPlanName} — Weekly Meal Subscription | Manoharam Real Foods`
    }
    return () => {
      document.title = "Manoharam Real Foods — Safe, as your mother's home."
    }
  }, [cleanPlanName])

  const pricePerWeek = Number(plan?.price_per_week ?? 0)
  const totalPrice = pricePerWeek * selectedWeeks
  const pricePerDay = pricePerWeek > 0 ? Math.round(pricePerWeek / 7) : 0

  // Optional nutrition totals (only rendered if genuine non-zero nutrition data exists)
  const totals = useMemo(() => {
    return products.reduce(
      (acc, p) => ({
        calories: acc.calories + (p.nutrition?.calories ?? 0),
        protein: acc.protein + (p.nutrition?.protein ?? 0),
        carbs: acc.carbs + (p.nutrition?.carbs ?? 0),
        fat: acc.fat + (p.nutrition?.fat ?? 0),
        fiber: acc.fiber + (p.nutrition?.fiber ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    )
  }, [products])

  const hasGenuineNutrition = totals.calories > 0

  // Curated gallery items (plan hero image + each unique product image)
  const galleryItems = useMemo(() => {
    const list = []
    if (defaultImage) {
      list.push({
        id: 'plan-main',
        title: 'Complete Plan Feast',
        imageUrl: defaultImage,
      })
    }
    products.forEach((p, idx) => {
      if (p.image_url && !list.some((item) => item.imageUrl === p.image_url)) {
        list.push({
          id: `product-${p.id}`,
          title: `Meal #${p.delivery_order || idx + 1}: ${cleanText(p.name)}`,
          imageUrl: p.image_url,
        })
      }
    })
    return list
  }, [defaultImage, products])

  const handleSubscribe = () => {
    if (!plan) return
    const statePayload = {
      plan,
      weeks: selectedWeeks,
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: {
            pathname: `/subscribe/${plan.id}`,
            state: statePayload,
          },
        },
      })
      return
    }

    navigate(`/subscribe/${plan.id}`, { state: statePayload })
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 pb-32 sm:pb-24">
        {/* =========================================================================
            1. REFINED BREADCRUMB NAVIGATION
            ========================================================================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink-500">
          <Link to="/" className="hover:text-chili-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-cream-400 select-none" />
          <Link to="/subscription" className="hover:text-chili-600 transition-colors">
            Weekly Subscriptions
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-cream-400 select-none" />
          <span className="font-semibold text-ink-900 truncate max-w-[200px] sm:max-w-md">
            {cleanPlanName}
          </span>
        </nav>

        {/* Loading skeleton */}
        {isLoading ? (
          <PlanDetailsSkeleton />
        ) : isError || !plan ? (
          /* Error feedback */
          <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-chili-200 bg-chili-50/70 p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 text-chili-600 shadow-xs">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink-900">Subscription Plan Unavailable</h2>
              <p className="mt-1 text-xs text-ink-600">
                This meal rotation could not be retrieved from the kitchen database.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
              <Link to="/subscription">
                <Button variant="primary" size="sm">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* =========================================================================
                2. MAIN PLAN PRESENTATION — EDITORIAL FOOD-FIRST COMPOSITION (2 COLUMNS)
                ========================================================================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* LEFT COLUMN (7 Cols): Master Culinary Photography Canvas */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative aspect-[16/11] sm:aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-amber-900/15 bg-gradient-to-b from-[#FAF4EB] via-[#F6EFE5] to-[#FAF4EB] shadow-md select-none group">
                  <ProductImage
                    src={activePhoto || defaultImage}
                    alt={cleanPlanName}
                    category={plan.category}
                    className="h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-103"
                    loading="eager"
                  />

                  {/* Soft ambient vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent opacity-80" />

                  {/* Dietary Badge Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <DietaryMark isVeg={isVeg} />
                  </div>

                  {/* Frequency Pill */}
                  <div className="absolute top-4 right-4 z-10 hidden sm:block">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-950/75 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-cream-100 border border-cream-100/20 shadow-xs">
                      <Clock className="h-3 w-3 text-amber-400" />
                      Daily Lunch Rotation
                    </span>
                  </div>

                  {/* Active Dish Tag (when browsing specific rotation items) */}
                  {activePhoto && activePhoto !== defaultImage ? (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="rounded-xl bg-ink-950/85 backdrop-blur-md px-4 py-2 border border-cream-100/20 shadow-lg text-cream-50 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-cream-100 truncate">
                          {galleryItems.find((g) => g.imageUrl === activePhoto)?.title || 'Curated Meal Dish'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActivePhoto(defaultImage)}
                          className="shrink-0 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                        >
                          View Master Feast
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Sub-gallery photo switcher: if multiple genuine dishes exist */}
                {galleryItems.length > 1 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
                      <span>Explore meals in this plan:</span>
                      <span className="text-[11px] text-ink-400">Tap to preview photo</span>
                    </div>

                    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                      {galleryItems.map((item) => {
                        const isCurrent = activePhoto === item.imageUrl
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActivePhoto(item.imageUrl)}
                            className={`group relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                              isCurrent
                                ? 'border-chili-600 ring-2 ring-chili-400/30 scale-102 shadow-sm'
                                : 'border-cream-300/80 hover:border-amber-700/40 opacity-80 hover:opacity-100'
                            }`}
                            title={item.title}
                          >
                            <ProductImage
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                            {isCurrent ? (
                              <div className="absolute inset-0 bg-chili-600/10 pointer-events-none" />
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* RIGHT COLUMN (5 Cols): Plan Information, Duration & Purchasing Controls */}
              <div className="lg:col-span-5 space-y-6 lg:pl-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-chili-700">
                      {isVeg ? 'Vegetarian Homestyle Plan' : 'Non-Vegetarian Meal Plan'}
                    </span>
                    <span className="text-cream-400 select-none">·</span>
                    <span className="text-xs text-ink-500 font-medium">
                      {products.length} Delicac{products.length === 1 ? 'y' : 'ies'} in Rotation
                    </span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink-950 leading-tight tracking-tight">
                    {cleanPlanName}
                  </h1>

                  {plan.description ? (
                    <p className="text-sm leading-relaxed text-ink-700 font-sans font-normal pt-1">
                      {plan.description}
                    </p>
                  ) : null}
                </div>

                {/* Primary Price Lockup */}
                <div className="rounded-2xl border border-cream-300/80 bg-cream-50/70 p-4.5 sm:p-5 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block">
                    Subscription Pricing
                  </span>
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="font-serif text-3xl sm:text-4xl font-extrabold text-chili-600 tabular-nums">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm text-ink-600 font-medium">
                      for {selectedWeeks} {selectedWeeks === 1 ? 'week' : 'weeks'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-ink-500 pt-1">
                    <span className="font-medium text-ink-700">₹{pricePerWeek.toLocaleString('en-IN')} / week</span>
                    <span className="text-cream-400 select-none">·</span>
                    <span>≈ ₹{pricePerDay.toLocaleString('en-IN')} per delivery day</span>
                  </div>
                </div>

                {/* Subscription Duration Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-ink-800">
                      Choose Duration Cycle
                    </label>
                    <span className="text-[11px] text-ink-500 font-normal">Pause or cancel anytime</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {DURATION_CYCLES.map((cycle) => {
                      const isSelected = selectedWeeks === cycle.weeks
                      return (
                        <button
                          key={cycle.weeks}
                          type="button"
                          onClick={() => setSelectedWeeks(cycle.weeks)}
                          className={`relative flex flex-col p-3 rounded-2xl text-left border-2 transition-all ${
                            isSelected
                              ? 'border-chili-600 bg-cream-50 shadow-xs'
                              : 'border-cream-300/80 bg-white hover:border-cream-400 hover:bg-cream-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span
                              className={`font-serif text-sm font-bold ${
                                isSelected ? 'text-chili-700' : 'text-ink-900'
                              }`}
                            >
                              {cycle.label}
                            </span>
                            {isSelected ? (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-chili-600 text-cream-50">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                            ) : null}
                          </div>

                          <span className="text-[11px] text-ink-500 mt-0.5">
                            {cycle.subtitle}
                          </span>

                          <span className="font-serif text-xs font-semibold text-ink-800 mt-2">
                            ₹{(pricePerWeek * cycle.weeks).toLocaleString('en-IN')}
                          </span>

                          {cycle.badge ? (
                            <span className="absolute -top-2 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink-950 shadow-2xs">
                              {cycle.badge}
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Delivery & Schedule Information (Clean & Supported by Backend) */}
                <div className="space-y-2.5 pt-1 border-t border-cream-200">
                  <div className="flex items-start gap-2.5 text-xs text-ink-600">
                    <CalendarCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-ink-900">1-Tap Date Skipping:</strong> You can skip any date with full rollover credits directly from your subscription calendar.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-ink-600">
                    <Clock className="h-4 w-4 text-success-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-ink-900">Morning Kitchen Dispatch:</strong> Freshly cooked hot meals delivered straight to your door before lunch (10:30 AM – 12:30 PM).
                    </div>
                  </div>
                </div>

                {/* Desktop Primary Purchase Action Area */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    className="button-press spring-bounce w-full flex items-center justify-center gap-2.5 rounded-2xl bg-chili-600 px-6 py-4 text-base font-bold text-cream-50 shadow-md shadow-chili-950/20 hover:bg-chili-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all cursor-pointer"
                  >
                    <span>
                      {isAuthenticated ? `Continue to Schedule — ₹${totalPrice.toLocaleString('en-IN')}` : `Sign In to Subscribe — ₹${totalPrice.toLocaleString('en-IN')}`}
                    </span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <p className="text-center text-[11px] text-ink-400">
                    Select your delivery start date on the next step. Cancel or pause anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* =========================================================================
                3. CURATED ROTATION MENU — THE DELICACIES IN THIS PLAN
                ========================================================================= */}
            <section className="pt-8 border-t border-cream-300 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-chili-700 block">
                    Curated Kitchen Menu
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950 mt-0.5">
                    Included Delicacies & Rotation ({products.length})
                  </h2>
                </div>
                <p className="text-xs text-ink-500">
                  Delivered sequentially throughout your subscription cycle
                </p>
              </div>

              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-cream-300 bg-cream-50 p-8 text-center text-xs text-ink-500">
                  Daily delicacy rotation for this plan will be published shortly by our head chef.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product, idx) => {
                    const cleanProductName = cleanText(product.name)
                    const portionText =
                      product.quantity && product.unit
                        ? `${product.quantity} ${product.unit}`
                        : product.unit || ''

                    return (
                      <div
                        key={product.id || idx}
                        className="group flex items-center gap-4 rounded-2xl border border-cream-300/80 bg-cream-50/70 p-3.5 sm:p-4 shadow-2xs hover:border-chili-300 hover:bg-cream-50 transition-all"
                      >
                        {/* Delivery Order Sequence Tag */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chili-50 text-xs font-bold text-chili-700 border border-chili-200/80 tabular-nums">
                          #{product.delivery_order || idx + 1}
                        </div>

                        {/* Delicacy Thumbnail */}
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-200 border border-cream-300/80">
                          <ProductImage
                            src={product.image_url}
                            alt={cleanProductName}
                            category={plan.category}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Title & Portion */}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-serif text-base font-bold text-ink-900 group-hover:text-chili-600 transition-colors">
                            {cleanProductName}
                          </h3>
                          {portionText ? (
                            <p className="text-xs text-ink-500 mt-0.5">
                              Portion: {portionText}
                            </p>
                          ) : null}

                          {/* Preview button for this delicacy */}
                          {product.image_url ? (
                            <button
                              type="button"
                              onClick={() => {
                                setActivePhoto(product.image_url)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }}
                              className="mt-1 text-[11px] font-semibold text-chili-600 hover:underline inline-block"
                            >
                              Show photograph ↑
                            </button>
                          ) : null}
                        </div>

                        {/* Conditional nutrition indicator (only if genuinely recorded in DB) */}
                        {product.nutrition?.calories ? (
                          <div className="hidden sm:flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            <span className="tabular-nums">{Math.round(product.nutrition.calories)} kcal</span>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Genuine Nutrition Overview (ONLY rendered if real non-zero nutrition values exist) */}
            {hasGenuineNutrition ? (
              <section className="rounded-3xl border border-cream-300 bg-cream-50 p-6 space-y-4 shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-chili-700 block">
                    Nutritional Profile
                  </span>
                  <h3 className="font-serif text-lg font-bold text-ink-950">
                    Weekly Nutritional Overview
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="rounded-xl border border-cream-200 bg-white p-3">
                    <p className="font-serif text-lg font-bold text-ink-900 tabular-nums">
                      {Math.round(totals.calories)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">kcal</p>
                  </div>
                  <div className="rounded-xl border border-cream-200 bg-white p-3">
                    <p className="font-serif text-lg font-bold text-ink-900 tabular-nums">
                      {Math.round(totals.protein)}g
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Protein</p>
                  </div>
                  <div className="rounded-xl border border-cream-200 bg-white p-3">
                    <p className="font-serif text-lg font-bold text-ink-900 tabular-nums">
                      {Math.round(totals.carbs)}g
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Carbs</p>
                  </div>
                  <div className="rounded-xl border border-cream-200 bg-white p-3">
                    <p className="font-serif text-lg font-bold text-ink-900 tabular-nums">
                      {Math.round(totals.fat)}g
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Fat</p>
                  </div>
                  <div className="rounded-xl border border-cream-200 bg-white p-3">
                    <p className="font-serif text-lg font-bold text-ink-900 tabular-nums">
                      {Math.round(totals.fiber)}g
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-500">Fiber</p>
                  </div>
                </div>
              </section>
            ) : null}

            {/* =========================================================================
                4. KITCHEN PURITY REASSURANCE STRIP
                ========================================================================= */}
            <div className="rounded-2xl border border-amber-900/15 bg-gradient-to-r from-[#FAF4EB] via-[#F6EFE5] to-[#FAF4EB] p-5 sm:p-6 shadow-2xs flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-chili-600 text-cream-50 shadow-xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1 text-xs text-ink-700 leading-relaxed">
                <p className="font-serif text-sm font-bold text-ink-950">
                  Manoharam Kitchen Purity Commitment
                </p>
                <p>
                  Every subscription rotation is prepared fresh at dawn using 100% cold-pressed sesame and groundnut oils, stone-ground masalas, and zero artificial preservatives. Safe and wholesome for your entire family, exactly like food cooked with motherly care.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =========================================================================
          5. MOBILE STICKY PURCHASE BAR (Floats cleanly above BottomNav on mobile)
          ========================================================================= */}
      {!isLoading && plan ? (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-4 z-30 mx-auto max-w-lg px-3 lg:hidden pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl border border-cream-300 bg-cream-50/98 p-3 shadow-xl backdrop-blur-md">
            <div className="pl-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-ink-500">
                  {selectedWeeks} {selectedWeeks === 1 ? 'Week' : 'Weeks'} Plan
                </span>
                <span className="text-cream-400 select-none text-[10px]">·</span>
                <span className="text-[10px] text-ink-500 font-medium">
                  ₹{pricePerWeek.toLocaleString('en-IN')}/wk
                </span>
              </div>
              <p className="font-serif text-xl font-extrabold text-chili-600 tabular-nums leading-none mt-0.5">
                ₹{totalPrice.toLocaleString('en-IN')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubscribe}
              className="button-press spring-bounce flex items-center gap-2 rounded-xl bg-chili-600 px-5 py-2.5 text-sm font-bold text-cream-50 shadow-md shadow-chili-950/20 active:bg-chili-700 hover:bg-chili-500 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Continue' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function PlanDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 aspect-[4/3] rounded-3xl bg-cream-200" />
        <div className="lg:col-span-5 space-y-4">
          <div className="h-4 w-32 rounded bg-cream-200" />
          <div className="h-10 w-3/4 rounded-xl bg-cream-200" />
          <div className="h-16 w-full rounded-2xl bg-cream-200" />
          <div className="h-28 w-full rounded-2xl bg-cream-200" />
          <div className="h-12 w-full rounded-2xl bg-cream-200" />
        </div>
      </div>
      <div className="h-48 w-full rounded-3xl bg-cream-200" />
    </div>
  )
}