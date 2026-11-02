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
} from 'lucide-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import ProductCard from '../components/ProductCard'
import TodayDeliveryBanner from '../components/TodayDeliveryBanner'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { HeritageKolamDivider } from '../components/ui/HeritagePattern'
import ProductImage from '../components/ProductImage'
import { listProducts, listCategories } from '../api/products'
import { listSubscribableSalads } from '../api/subscriptions'
import logo from '../assets/logo.png'
import heroBanner from '../assets/food/hero-banner.jpg'
import WelcomeModal from '../components/WelcomeModal'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [visibleCount, setVisibleCount] = useState(8)
  const [isChangingCategory, setIsChangingCategory] = useState(false)

  // Subtle pointer parallax for the Hero section (strictly preserved)
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
    () => productsQuery.data?.pages?.flatMap((page) => page?.products || []).filter(Boolean) ?? [],
    [productsQuery.data],
  )

  const categories = useMemo(() => {
    const backendCategories = categoriesQuery.data?.categories?.map((c) => c?.category).filter(Boolean) || []
    const productCategories = allProducts.map((p) => p?.category).filter(Boolean)
    const combined = Array.from(new Set([...backendCategories, ...productCategories]))
    return ['All', ...combined]
  }, [categoriesQuery.data, allProducts])

  // Products filtered by currently selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts
    return allProducts.filter((p) => p?.category === activeCategory)
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

  const lowestPlanPrice = useMemo(() => {
    if (!activePlans.length) return 310
    const prices = activePlans.map((p) => Number(p.price_per_week || 0)).filter((pr) => pr > 0)
    return prices.length ? Math.min(...prices) : 310
  }, [activePlans])

  // Dynamic image delivered by backend subscription plans for promotional campaign banner
  const subscriptionBannerImage = useMemo(() => {
    const planWithImage = activePlans.find((p) => Boolean(p.image_url))
    return planWithImage?.image_url || activePlans[0]?.image_url || ''
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
            1. HERO SECTION — STRICTLY PRESERVED (NON-NEGOTIABLE)
            All copy, dark photo, headline, logos, badges and CTAs kept identical.
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
            2. REIMAGINED SUBSCRIPTION BANNER — CINEMATIC FOOD ADVERTISING CAMPAIGN
            - Food is the star: 65% photographic visual weight with exquisite South Indian feast
            - Short, emotionally appealing headline: "A Taste of Home, Every Day."
            - Asymmetric editorial composition with clear dynamic backend pricing & single CTA
            ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-amber-900/15 bg-gradient-to-r from-[#FAF4EB] via-[#F6EFE5] to-[#FAF4EB] shadow-lg group">
            {/* Subtle background Kolam paper grain */}
            <div
              className="absolute inset-0 opacity-[0.035] pointer-events-none select-none"
              style={{
                backgroundImage: 'radial-gradient(#9B2C2C 0.75px, transparent 0.75px)',
                backgroundSize: '18px 18px',
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[420px] relative z-10">
              {/* Left Column (5 Cols on desktop): Refined Editorial Advertising Lockup */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center p-6 sm:p-8 lg:p-10 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-chili-600/30 bg-chili-50/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-chili-700 shadow-2xs self-start">
                  <CalendarCheck className="h-3.5 w-3.5 text-chili-600" />
                  <span>Weekly Meal Subscription</span>
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-bold text-ink-900 leading-[1.12] tracking-tight">
                  A Taste of Home, Every Day.
                </h2>

                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed font-sans font-normal max-w-md">
                  Wholesome South Indian thali rotations, slow-cooked fresh at dawn in 100% cold-pressed oils. Delivered steaming hot to your doorstep before lunch.
                </p>

                {/* Dynamic Value Strip from Backend */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">Plans from</span>
                    <span className="font-serif text-2xl sm:text-3xl font-extrabold text-chili-600">
                      ₹{lowestPlanPrice}
                    </span>
                    <span className="text-xs text-ink-500 font-medium">/ week</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-amber-600" /> Free Morning Delivery
                    </span>
                    <span className="text-cream-400 select-none">·</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" /> 1-Tap Date Skipping
                    </span>
                  </div>
                </div>

                {/* Single Clear CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/subscription"
                    className="button-press spring-bounce inline-flex items-center gap-2.5 rounded-xl bg-chili-600 px-7 py-3.5 text-sm font-bold text-cream-50 shadow-md shadow-chili-900/25 hover:bg-chili-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all duration-200"
                  >
                    <span>Explore Weekly Plans</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <span className="text-xs text-ink-500 font-medium">
                    Pause or cancel anytime
                  </span>
                </div>
              </div>

              {/* Right Column (7 Cols on desktop): Dominant Culinary Campaign Photography */}
              <div className="lg:col-span-7 order-1 lg:order-2 relative min-h-[300px] sm:min-h-[360px] lg:min-h-[440px] overflow-hidden">
                <ProductImage
                  src={subscriptionBannerImage}
                  alt="Weekly Meal Subscription — Fresh South Indian Homestyle Feast"
                  category="Subscription Meal"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                {/* Soft directional gradient to seamlessly fuse photo with editorial container */}
                <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#FAF4EB] via-[#FAF4EB]/30 to-transparent hidden lg:block pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Campaign Stamps */}
                <div className="absolute top-4 right-4 rounded-full bg-ink-950/75 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-cream-100 border border-cream-100/20 shadow-md">
                  <span className="text-amber-400 font-bold mr-1.5">✦</span>Mon–Sun Fresh Homestyle Rotations
                </div>

                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 rounded-xl bg-ink-950/80 backdrop-blur-md p-3 text-cream-100 border border-cream-100/15 shadow-lg max-w-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>100% Cold-Pressed Chekku Oils</span>
                  </div>
                  <p className="text-[11px] text-cream-200 mt-1 leading-snug">
                    Slow-cooked at dawn. Never reused oil, zero artificial colors or flavor enhancers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. PRODUCT DISCOVERY — ATTRACTIVE SHOPPING-FOCUSED DELICACY CATALOGUE
            - Sticky category rail with counts and smooth active states
            - Refined 4:5 product cards with breathing room, bold prices, and tactile quick-add
            - Outlined view more action with live counter
            ========================================================================= */}
        <section id="catalog" className="scroll-mt-20 px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header with Search Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-cream-300 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-chili-600 block">
                Artisanal Pantry
              </span>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-ink-900">
                Traditional Delicacies & Podis
              </h2>
              <p className="text-xs text-ink-500 mt-1">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'delicacy' : 'delicacies'} slow-crafted in artisanal small batches
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

          {/* Sticky, Smooth Category Navigation Strip */}
          <div className="sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-cream-100/95 backdrop-blur-md py-2.5 border-b border-cream-200/80">
            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none select-none"
              role="tablist"
              aria-label="Category navigation"
            >
              {categories.map((cat) => {
                const count =
                  cat === 'All'
                    ? allProducts.length
                    : allProducts.filter((p) => p?.category === cat).length
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
          </div>

          {/* Product Cards Grid */}
          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
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
              {/* Refined 4-Column Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginatedCatalog.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* View More Outlined Button */}
              {hasMoreInLocalFilter ? (
                <div className="pt-10 flex flex-col items-center gap-3">
                  <span className="text-xs font-semibold text-ink-500">
                    Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} delicacies
                  </span>

                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="button-press spring-bounce min-w-[220px] py-2.5 text-xs font-bold border-cream-300 hover:border-chili-400 hover:text-chili-600 shadow-2xs"
                  >
                    <span>View More Delicacies</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : productsQuery.hasNextPage ? (
                <div className="pt-10 flex flex-col items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => productsQuery.fetchNextPage()}
                    disabled={productsQuery.isFetchingNextPage}
                    loading={productsQuery.isFetchingNextPage}
                    className="button-press spring-bounce min-w-[220px] py-2.5 text-xs font-bold border-cream-300 hover:border-chili-400 hover:text-chili-600 shadow-2xs"
                  >
                    <span>Load More From Kitchen</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </section>

        {/* =========================================================================
            4. DISTINCTIVE VISUAL MOMENT — CLOSING SIGNOFF
            Intentional, elegant transition into the footer with brand signature
            ========================================================================= */}
        <div className="pt-2 pb-6 text-center space-y-3.5">
          <div className="flex justify-center opacity-60">
            <HeritageKolamDivider className="max-w-xs text-amber-700/40" />
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-cream-50 border border-cream-300 p-1 shadow-2xs">
              <img src={logo} alt="Manoharam Kitchen Crest" className="h-full w-auto object-contain mx-auto" />
            </div>
            <span className="font-serif text-base font-bold text-ink-900 tracking-tight">
              Manoharam Real Foods
            </span>
          </div>

          <p className="font-serif italic text-xs sm:text-sm text-chili-700 max-w-md mx-auto">
            “From our kitchen to your family table with pure reverence.”
          </p>

          <div className="h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
        </div>
      </div>

      {/* First-Time Welcome Modal */}
      <WelcomeModal />
    </AppShell>
  )
}