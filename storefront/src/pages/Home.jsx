import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CalendarCheck,
} from 'lucide-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import ProductCard from '../components/ProductCard'
import TodayDeliveryBanner from '../components/TodayDeliveryBanner'
import { listProducts, listCategories } from '../api/products'
import logo from '../assets/logo.png'
import heroBanner from '../assets/food/hero-banner.jpg'
import mangoPickleThumb from '../assets/food/mango-pickle.jpg'
import traditionalMealsThumb from '../assets/food/traditional-meals.jpg'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', 'list'],
    queryFn: ({ pageParam }) => listProducts({ cursor: pageParam, limit: 12 }),
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

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'All') return allProducts
    return allProducts.filter((p) => p.category === activeCategory)
  }, [allProducts, activeCategory])

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-10">
        {/* Today's Delivery Banner (if logged-in user has a scheduled meal today) */}
        <TodayDeliveryBanner />

        {/* =========================================================================
            FOOD-FIRST HERO SECTION
            ========================================================================= */}
        <section className="relative overflow-hidden rounded-2xl border border-[#E6D9C5] bg-[#1C1917] shadow-sm">
          {/* Main Food Photo Background / Visual */}
          <div className="relative min-h-[320px] sm:min-h-[380px] md:min-h-[420px] w-full">
            <img
              src={heroBanner}
              alt="Authentic handcrafted South Indian food prepared with cold-pressed oils"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            {/* Soft Warm Gradient Overlay so text and branding are crystal clear while food photography shines */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30 sm:w-4/5" />

            {/* Concise Hero Content */}
            <div className="relative z-10 flex min-h-[320px] sm:min-h-[380px] md:min-h-[420px] max-w-xl flex-col justify-center p-5 sm:p-8 md:p-10">
              {/* Brand Logo & Name */}
              <div className="flex items-center gap-2.5 mb-3">
                <img
                  src={logo}
                  alt="Manoharam Real Foods"
                  className="h-9 sm:h-11 w-auto object-contain drop-shadow-md"
                />
                <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm">
                  Manoharam Real Foods
                </span>
              </div>

              {/* Mandatory Official Tagline — Prominently Featured */}
              <div className="inline-flex items-center self-start gap-2 rounded-full border border-amber-300/40 bg-black/40 px-3.5 py-1.5 backdrop-blur-md mb-3">
                <span className="font-serif text-xs sm:text-sm md:text-base italic font-semibold text-amber-200 tracking-wide">
                  “Safe, as your mother's home.”
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Handcrafted Traditional Food, Made Pure
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-[#F3EBDD]/90 max-w-md leading-relaxed">
                Prepared in small batches with cold-pressed oils, natural ingredients, and authentic homestyle care.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-md bg-[#9B2C2C] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#7B1F23] active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <Link
                  to="/subscription"
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-xs hover:bg-white/20 active:scale-95 transition-all"
                >
                  <CalendarCheck className="h-4 w-4 text-[#FDEBB2]" />
                  <span>Meal Plans</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            CATEGORY DISCOVERY — Dynamic & Food-First
            ========================================================================= */}
        <section aria-label="Product categories" className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Dynamic Categories from Backend */}
          {categories
            .filter((cat) => cat !== 'All')
            .map((cat) => (
              <a
                key={cat}
                href="#products"
                onClick={() => setActiveCategory(cat)}
                className="group flex items-center gap-3 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-3 sm:p-4 shadow-xs hover:border-[#9B2C2C]/40 hover:shadow-sm transition-all"
              >
                <div className="relative h-13 w-13 sm:h-15 sm:w-15 shrink-0 overflow-hidden rounded-lg bg-[#F3EBDD]">
                  <img
                    src={mangoPickleThumb}
                    alt={cat}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors truncate">
                    {cat}
                  </p>
                  <p className="text-[11px] text-[#78716C]">
                    Browse selection
                  </p>
                </div>
              </a>
            ))}

          {/* Weekly Plans Category Tile */}
          <Link
            to="/subscription"
            className="group flex items-center gap-3 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-3 sm:p-4 shadow-xs hover:border-[#9B2C2C]/40 hover:shadow-sm transition-all"
          >
            <div className="relative h-13 w-13 sm:h-15 sm:w-15 shrink-0 overflow-hidden rounded-lg bg-[#F3EBDD]">
              <img
                src={traditionalMealsThumb}
                alt="Weekly Subscriptions"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-sm sm:text-base font-bold text-[#1C1917] group-hover:text-[#9B2C2C] transition-colors truncate">
                Weekly Meal Plans
              </p>
              <p className="text-[11px] text-[#78716C]">
                Scheduled delivery
              </p>
            </div>
          </Link>
        </section>

        {/* =========================================================================
            PRODUCTS CATALOG — FOOD FIRST
            ========================================================================= */}
        <section id="products" className="scroll-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E6D9C5] pb-3">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                {activeCategory === 'All' ? 'Our Food Catalog' : activeCategory}
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                {visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'} available
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Category Filter Tabs */}
              {categories.length > 1 ? (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                        activeCategory === cat
                          ? 'bg-[#9B2C2C] text-white shadow-xs'
                          : 'border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] hover:border-[#9B2C2C]/30 hover:bg-[#FDF2F2]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              ) : null}

              <Link
                to="/search"
                className="inline-flex items-center gap-1 rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-2.5 py-1.5 text-xs font-medium text-[#78716C] hover:text-[#9B2C2C] hover:border-[#9B2C2C]/30 transition-colors shrink-0"
                aria-label="Search all products"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
              </Link>
            </div>
          </div>

          {/* Products Grid: 2-column mobile, 3 tablet, 4 desktop */}
          {productsQuery.isLoading ? (
            <ProductsSkeleton />
          ) : productsQuery.isError ? (
            <div className="mt-6 flex flex-col items-start gap-3 rounded-xl border border-dashed border-[#F9C5C5] bg-[#FDF2F2] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#9B2C2C] shadow-xs">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">Could not load products</p>
                  <p className="text-xs text-[#78716C]">Please check your connection and retry.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#9B2C2C]/30 bg-white px-4 py-1.5 text-xs font-bold text-[#9B2C2C] shadow-xs hover:bg-[#9B2C2C] hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] px-5 py-12 text-center">
              <ShoppingBag className="h-8 w-8 text-[#A8A29E]" />
              <p className="font-serif text-base font-bold text-[#1C1917]">
                {activeCategory === 'All'
                  ? 'No products available yet'
                  : `No products in "${activeCategory}"`}
              </p>
              <p className="text-xs text-[#78716C]">Please check back soon.</p>
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productsQuery.hasNextPage ? (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => productsQuery.fetchNextPage()}
                    disabled={productsQuery.isFetchingNextPage}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-5 py-2 text-xs font-bold text-[#1C1917] shadow-xs hover:border-[#9B2C2C]/30 hover:bg-[#FDF2F2] hover:text-[#9B2C2C] disabled:opacity-60 transition-all"
                  >
                    {productsQuery.isFetchingNextPage ? (
                      'Loading…'
                    ) : (
                      <>
                        <span>Load more products</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* =========================================================================
            WEEKLY SUBSCRIPTION BANNER (COMPACT & FOOD-FOCUSED)
            ========================================================================= */}
        <section className="overflow-hidden rounded-2xl border border-[#E6D9C5] bg-gradient-to-r from-[#FAF6EF] via-[#FFFDF9] to-[#F5ECE1] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#F3EBDD] shadow-xs">
                <img
                  src={traditionalMealsThumb}
                  alt="Weekly meal subscriptions"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B2C2C]">
                  Scheduled Service
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
                  Weekly Food & Meal Subscriptions
                </h3>
                <p className="mt-0.5 text-xs text-[#78716C]">
                  Fresh home-style delivery on your schedule. 1-tap date skipping anytime.
                </p>
              </div>
            </div>

            <Link
              to="/subscription"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#9B2C2C] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23] active:scale-95 transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <span>Explore Weekly Plans</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* =========================================================================
            COMPACT BRAND NOTE
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#E6D9C5]/80 bg-[#FFFEFC] px-5 py-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Manoharam Real Foods"
              className="h-10 w-auto object-contain shrink-0"
            />
            <div>
              <p className="font-serif text-sm font-bold text-[#1C1917]">
                Manoharam Real Foods
              </p>
              <p className="font-serif text-xs italic text-[#9B2C2C]">
                “Safe, as your mother's home.”
              </p>
            </div>
          </div>
          <p className="text-xs text-[#78716C] max-w-md">
            Prepared in small batches with 100% cold-pressed oils, sun-cured spices, and pure homestyle care. Zero artificial preservatives.
          </p>
        </div>
      </div>
    </AppShell>
  )
}

function ProductsSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#E6D9C5] bg-white p-2.5 sm:p-3 shadow-xs">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-[#F3EBDD]" />
          <div className="mt-2.5 space-y-1.5">
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#F3EBDD]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#F3EBDD]" />
          </div>
        </div>
      ))}
    </div>
  )
}