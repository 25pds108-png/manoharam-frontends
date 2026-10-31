import { useMemo, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Flame,
  Droplets,
  HeartHandshake,
  Sparkles,
  Truck,
  Clock,
  Check,
} from 'lucide-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import ProductCard from '../components/ProductCard'
import ProductImage from '../components/ProductImage'
import TodayDeliveryBanner from '../components/TodayDeliveryBanner'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { HeritageKolamDivider } from '../components/ui/HeritagePattern'
import { listProducts, listCategories } from '../api/products'
import { listSubscribableSalads } from '../api/subscriptions'
import logo from '../assets/logo.png'
import heroBanner from '../assets/food/hero-banner.jpg'
import traditionalMeals from '../assets/food/traditional-meals.jpg'
import WelcomeModal from '../components/WelcomeModal'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(8)
  const [isChangingCategory, setIsChangingCategory] = useState(false)
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0)

  // Subtle pointer parallax for the Hero section
  const [heroParallax, setHeroParallax] = useState({ x: 0, y: 0 })
  const categoryScrollRef = useRef(null)

  const handleHeroMouseMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const normX = (e.clientX - rect.left) / rect.width - 0.5
    const normY = (e.clientY - rect.top) / rect.height - 0.5
    setHeroParallax({ x: normX * 16, y: normY * 16 })
  }

  const handleHeroMouseLeave = () => {
    setHeroParallax({ x: 0, y: 0 })
  }

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const plansQuery = useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: listSubscribableSalads,
  })

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'list'],
    queryFn: ({ pageParam }) => listProducts({ cursor: pageParam, limit: 50 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.has_more ? lastPage.pagination.next_cursor : undefined,
  })

  const allProducts = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.products) ?? [],
    [productsQuery.data],
  )

  const categories = useMemo(() => {
    const backendCategories = categoriesQuery.data?.categories?.map((c) => c.category) || []
    const productCategories = allProducts.map((p) => p.category).filter(Boolean)
    const combined = Array.from(new Set([...backendCategories, ...productCategories]))
    return ['All', ...combined]
  }, [categoriesQuery.data, allProducts])

  // Products filtered by currently selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts
    return allProducts.filter((p) => p.category === activeCategory)
  }, [allProducts, activeCategory])

  // Paginated view for catalog grid
  const paginatedCatalog = useMemo(() => {
    return filteredProducts.slice(0, visibleCount)
  }, [filteredProducts, visibleCount])

  const hasMoreInLocalFilter = visibleCount < filteredProducts.length

  // Filter valid active subscription plans with real data
  const activePlans = useMemo(() => {
    const rawPlans = plansQuery.data?.plans || []
    return rawPlans.filter((p) => p.status === 'ACTIVE' || !p.status)
  }, [plansQuery.data])

  const featuredPlan = activePlans[selectedPlanIndex] || activePlans[0]

  const lowestPlanPrice = useMemo(() => {
    if (!activePlans.length) return 350
    const prices = activePlans.map((p) => Number(p.price_per_week || 0)).filter((pr) => pr > 0)
    return prices.length ? Math.min(...prices) : 350
  }, [activePlans])

  // Smooth category transition handler
  const handleSelectCategory = (cat) => {
    if (cat === activeCategory) return
    setIsChangingCategory(true)
    setActiveCategory(cat)
    setVisibleCount(8)
    setTimeout(() => setIsChangingCategory(false), 180)
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      <div className="space-y-12 sm:space-y-16 md:space-y-20 pb-20">
        {/* Today's Scheduled Delivery Banner */}
        <div className="px-4 sm:px-6 lg:px-8">
          <TodayDeliveryBanner />
        </div>

        {/* =========================================================================
            1. HERO SECTION — PRESERVED IDENTITY WITH TACTILE POINTER PARALLAX
            ========================================================================= */}
        <section className="relative px-4 sm:px-6 lg:px-8">
          <div
            onMouseMove={handleHeroMouseMove}
            onMouseLeave={handleHeroMouseLeave}
            className="relative overflow-hidden rounded-[2rem] border border-amber-900/30 bg-ink-950 shadow-2xl min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center select-none"
          >
            {/* Background Hero Food Photography with subtle restrained parallax */}
            <div
              className="absolute inset-0 z-0 overflow-hidden"
              style={{
                transform: `translate3d(${-heroParallax.x * 0.8}px, ${-heroParallax.y * 0.8}px, 0) scale(1.06)`,
                transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img
                src={heroBanner}
                alt="Traditional South Indian homemade pickles in clay pots with cold-pressed oils"
                className="h-full w-full object-cover object-right md:object-center"
                loading="eager"
              />
              {/* Multi-layer lighting & gradient overlays for readability and warmth */}
              <div className="absolute inset-0 bg-gradient-to-r from-ink-950/98 via-ink-950/85 to-ink-950/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-transparent to-ink-950/40" />

              {/* Ambient saffron illumination glow */}
              <div
                className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-ambient-glow"
                style={{
                  transform: `translate3d(${heroParallax.x * 1.4}px, ${heroParallax.y * 1.4}px, 0)`,
                  transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>

            {/* Hero Editorial Content */}
            <div
              className="relative z-10 w-full p-6 sm:p-10 md:p-14 lg:p-16 max-w-3xl space-y-6"
              style={{
                transform: `translate3d(${heroParallax.x * 0.35}px, ${heroParallax.y * 0.35}px, 0)`,
                transition: 'transform 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-ink-900/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="font-serif text-xs sm:text-sm italic font-semibold text-amber-200">
                  “Safe, as your mother&apos;s home.”
                </span>
              </div>

              {/* Brand Crest & Identity */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-cream-50/10 border border-cream-100/20 p-2 backdrop-blur-md shadow-md">
                  <img
                    src={logo}
                    alt="Manoharam Real Foods"
                    className="h-full w-auto object-contain drop-shadow"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-cream-50 leading-none">
                    Manoharam
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400 mt-1">
                    Real Foods
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-cream-50 leading-[1.12]">
                Handcrafted Traditional Food, Made{' '}
                <span className="relative inline-block font-serif italic text-amber-400">
                  Pure
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500/30 rounded-full" />
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-cream-200/90 max-w-xl leading-relaxed font-normal font-sans">
                Slow-crafted in artisanal small batches with 100% cold-pressed oils, sun-cured spices, and pure reverence to heritage recipes. Zero preservatives or synthetic colors.
              </p>

              {/* Primary & Secondary Call To Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#catalog"
                  className="button-press spring-bounce inline-flex items-center gap-2 rounded-xl bg-chili-600 px-7 py-3.5 text-sm font-bold text-cream-50 shadow-lg shadow-chili-900/50 hover:bg-chili-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <span>Shop Delicacies</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  to="/subscription"
                  className="button-press spring-bounce inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-ink-900/60 px-7 py-3.5 text-sm font-semibold text-cream-50 shadow-sm backdrop-blur-md hover:bg-ink-900/90 hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <CalendarCheck className="h-4 w-4 text-amber-400" />
                  <span>Explore Meal Plans</span>
                </Link>
              </div>

              {/* Purity Standards Ribbon */}
              <div className="pt-6 border-t border-cream-100/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-cream-200 text-xs">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-[11px] sm:text-xs">Cold-Pressed Chekku Oils</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-[11px] sm:text-xs">Sun-Cured Spices</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-[11px] sm:text-xs">0 Preservatives</span>
                </div>
                <div className="flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-[11px] sm:text-xs">Small-Batch Care</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. REDESIGNED EDITORIAL SUBSCRIPTION PROMOTION — SHOWN ONCE ONLY
            Art-directed, appetizing meal photography, asymmetric balance, zero clutter
            ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-900/20 bg-gradient-to-br from-[#1E1714] via-[#241A16] to-[#15110F] text-cream-50 shadow-xl">
            {/* Subtle background warm ambient glow */}
            <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Left Column: Narrative, Value Proposition & Clear CTA */}
              <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 lg:p-14 flex flex-col justify-between space-y-6 relative z-10">
                <div className="space-y-4">
                  {/* Category Eyebrow */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-xs">
                    <CalendarCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span>Homestyle Meal Subscriptions</span>
                  </div>

                  {/* Strong & Concise Headline */}
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-cream-50 leading-tight">
                    Wholesome South Indian Meals, Delivered Daily to Your Door.
                  </h2>

                  {/* Compact Benefit Narrative */}
                  <p className="text-xs sm:text-sm text-cream-200/80 max-w-xl leading-relaxed font-sans font-normal">
                    Slow-cooked every morning with 100% cold-pressed oils, native grains, and heritage recipes. Flexible weekly rotations, 1-tap date skipping, and zero chemical preservatives.
                  </p>

                  {/* Integrated Plan Highlight (Real backend data) */}
                  {featuredPlan ? (
                    <div className="rounded-xl border border-amber-500/25 bg-amber-950/30 p-3.5 sm:p-4 backdrop-blur-xs max-w-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
                            Featured Weekly Rotation
                          </span>
                          <p className="font-serif text-sm sm:text-base font-bold text-cream-50 truncate mt-0.5">
                            {featuredPlan.name}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-serif text-lg sm:text-xl font-bold text-amber-400 tabular-nums">
                            ₹{Number(featuredPlan.price_per_week || 350).toFixed(0)}
                          </span>
                          <span className="text-[10px] text-cream-300 block">/ week</span>
                        </div>
                      </div>

                      {/* Interactive Plan Switcher if multiple plans exist */}
                      {activePlans.length > 1 ? (
                        <div className="mt-2.5 pt-2 border-t border-cream-100/10 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                          <span className="text-[10px] text-cream-300/70 shrink-0 mr-1">Other plans:</span>
                          {activePlans.slice(0, 3).map((plan, idx) => (
                            <button
                              key={`quick-plan-${plan.id}`}
                              type="button"
                              onClick={() => setSelectedPlanIndex(idx)}
                              className={`button-press rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                                selectedPlanIndex === idx
                                  ? 'bg-amber-500 text-ink-950 font-bold'
                                  : 'bg-cream-50/10 text-cream-200 hover:bg-cream-50/20'
                              }`}
                            >
                              {plan.name.replace(/\[.*?\]\s*/g, '').slice(0, 24)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Compact Value Markers */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-cream-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      Free Daily Delivery
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      1-Tap Date Skipping
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      Zero Preservatives
                    </span>
                  </div>
                </div>

                {/* Single Clear Call To Action */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    to="/subscription"
                    className="button-press spring-bounce inline-flex items-center gap-2.5 rounded-xl bg-chili-600 px-8 py-3.5 text-sm font-bold text-cream-50 shadow-lg shadow-chili-950/60 hover:bg-chili-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span>Explore Meal Plans</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-[11px] text-cream-300/80 font-normal">
                    Starting from ₹{lowestPlanPrice}/week · Pause or cancel anytime
                  </span>
                </div>
              </div>

              {/* Right Column: Large Appetizing Meal Photography */}
              <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[340px] lg:min-h-full overflow-hidden bg-ink-950">
                <ProductImage
                  src={featuredPlan?.image_url}
                  alt={featuredPlan?.name || 'South Indian homestyle meals'}
                  category="Meals"
                  className="h-full w-full object-cover min-h-[280px] lg:min-h-full transition-transform duration-700 ease-out hover:scale-104"
                />

                {/* Subtle vignette gradients for seamless integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent lg:hidden" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1E1714] via-transparent to-transparent hidden lg:block opacity-70" />

                {/* Plan Badge Overlay on Photo */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto flex items-center gap-2 rounded-xl bg-ink-950/85 border border-amber-500/30 px-3.5 py-2 backdrop-blur-md shadow-lg">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-cream-50 leading-tight">
                      Traditional Homestyle Rotation
                    </p>
                    <p className="text-[10px] text-amber-300/90">
                      Cooked fresh every dawn in cold-pressed oil
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. INTEGRATED CATEGORY NAVIGATION & PRODUCT DISCOVERY
            Single unified experience: compact interactive category rail + product grid
            Zero duplicated cards, zero redundant filter bars
            ========================================================================= */}
        <section id="catalog" className="scroll-mt-20 px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section Header with Search Action */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-cream-300 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-chili-600 block">
                Fresh From Our Kitchen
              </span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-ink-900">
                Artisanal Delicacies & Podis
              </h2>
              <p className="text-xs text-ink-500 mt-1">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'delicacy' : 'delicacies'} crafted with cold-pressed oils & sun-cured spices
              </p>
            </div>

            {/* Quick Search Action */}
            <Link
              to="/search"
              className="button-press inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-xs font-semibold text-ink-700 hover:text-chili-600 hover:border-chili-300 transition-colors shrink-0 shadow-xs self-start sm:self-auto"
              aria-label="Search all products"
            >
              <Search className="h-3.5 w-3.5 text-chili-600" />
              <span>Search Delicacies</span>
            </Link>
          </div>

          {/* Compact Category Navigation Bar (Single presentation, smooth interaction) */}
          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 select-none"
            role="tablist"
            aria-label="Category navigation"
          >
            {categories.map((cat) => {
              const count =
                cat === 'All'
                  ? allProducts.length
                  : allProducts.filter((p) => p.category === cat).length
              const isSelected = activeCategory === cat

              return (
                <button
                  key={`cat-nav-${cat}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectCategory(cat)}
                  className={`spring-bounce button-press relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-chili-600 text-cream-50 shadow-sm ring-2 ring-chili-600/30'
                      : 'border border-cream-300 bg-cream-50 text-ink-700 hover:border-chili-300 hover:bg-chili-50/60 hover:text-chili-600'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums ${
                      isSelected
                        ? 'bg-cream-50/25 text-cream-50'
                        : 'bg-cream-200 text-ink-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Catalog Grid with smooth category transition */}
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : productsQuery.isError ? (
            <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-chili-300 bg-chili-50 p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream-50 text-chili-600 shadow-xs">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink-900">Could not load food catalog</p>
                  <p className="text-xs text-ink-500">Please check your network connection and retry.</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => productsQuery.refetch()}
                className="shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-cream-300 bg-cream-50 px-6 py-16 text-center max-w-lg mx-auto">
              <ShoppingBag className="h-12 w-12 text-ink-300" strokeWidth={1.5} />
              <p className="font-serif text-xl font-bold text-ink-900">
                {activeCategory === 'All'
                  ? 'No delicacies currently available'
                  : `No delicacies in "${activeCategory}"`}
              </p>
              <p className="text-xs text-ink-500 max-w-sm leading-relaxed">
                Our kitchen prepares seasonal batches regularly. Please select another category or check back soon.
              </p>
            </div>
          ) : (
            <div
              className={`transition-opacity duration-200 ${
                isChangingCategory ? 'opacity-40' : 'opacity-100'
              }`}
            >
              <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {paginatedCatalog.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More Delicacies Action */}
              {hasMoreInLocalFilter ? (
                <div className="pt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="button-press spring-bounce min-w-[220px] py-3 text-xs font-bold shadow-xs hover:border-chili-300 hover:text-chili-600"
                  >
                    <span>View More Delicacies ({filteredProducts.length - visibleCount} remaining)</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              ) : productsQuery.hasNextPage ? (
                <div className="pt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => productsQuery.fetchNextPage()}
                    disabled={productsQuery.isFetchingNextPage}
                    loading={productsQuery.isFetchingNextPage}
                    className="button-press spring-bounce min-w-[220px] py-3 text-xs font-bold"
                  >
                    <span>Load More From Kitchen</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* =========================================================================
            4. BRAND STORY & KITCHEN STANDARDS — OUR HERITAGE PROMISE
            ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-cream-300 bg-cream-50 p-8 sm:p-12 lg:p-16 shadow-xs">
            <div className="mx-auto max-w-3xl text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-chili-600 block">
                Our Kitchen Heritage
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-ink-900">
                The Soul of Traditional South Indian Cooking
              </h2>
              <div className="flex justify-center opacity-70 my-2">
                <HeritageKolamDivider className="max-w-xs text-cream-300" />
              </div>
              <p className="font-serif text-base italic text-chili-600 font-medium">
                “Safe, as your mother&apos;s home.”
              </p>
              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-2xl mx-auto font-sans">
                We grew up in homes where cooking was an act of quiet reverence. No artificial essences, no chemical enhancers, no industrial shortcuts. Every jar of pickle, every pinch of podi, and every daily meal is prepared with patience, purity, and wholesome home care.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-cream-300">
              <div className="card-hover-effect space-y-3 rounded-2xl bg-cream-100/60 border border-cream-300/80 p-6 shadow-2xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chili-100 text-chili-600 border border-chili-200 shadow-2xs">
                  <Droplets className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">100% Wood-Pressed Oils</h3>
                <p className="text-xs text-ink-600 leading-relaxed font-sans">
                  We use wood-pressed sesame and groundnut oils extracted from pristine local seeds in traditional granite chekkus, retaining all natural antioxidants and aroma.
                </p>
              </div>

              <div className="card-hover-effect space-y-3 rounded-2xl bg-cream-100/60 border border-cream-300/80 p-6 shadow-2xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 shadow-2xs">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">Sun-Cured & Stone-Ground</h3>
                <p className="text-xs text-ink-600 leading-relaxed font-sans">
                  Chillies, turmeric, and fenugreek dried under the tropical sun and slow-ground on granite stones to preserve volatile aromatic oils and medicinal value.
                </p>
              </div>

              <div className="card-hover-effect space-y-3 rounded-2xl bg-cream-100/60 border border-cream-300/80 p-6 shadow-2xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-100 text-success-500 border border-success-200 shadow-2xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">Zero Artificial Preservatives</h3>
                <p className="text-xs text-ink-600 leading-relaxed font-sans">
                  Naturally preserved solely through unrefined rock salt, cold-pressed gingelly oil, and natural sun fermentation. Safe for every child and elder.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* First-Time Welcome Modal */}
      <WelcomeModal />
    </AppShell>
  )
}