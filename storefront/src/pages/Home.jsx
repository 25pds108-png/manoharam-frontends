import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Heart,
  Sparkles,
  Flame,
} from 'lucide-react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import AppShell from '../components/layout/AppShell'
import ProductCard from '../components/ProductCard'
import SubscriptionSection from '../components/SubscriptionSection'
import TodayDeliveryBanner from '../components/TodayDeliveryBanner'
import WelcomeModal from '../components/WelcomeModal'
import { listProducts, listCategories } from '../api/products'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

export default function Home() {
  const { user } = useAuth()
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
    if (activeCategory === 'All') return allProducts;
    return allProducts.filter((p) => p.category === activeCategory)
  }, [allProducts, activeCategory])

  const firstName = user?.name?.split(' ')[0]

  return (
    <AppShell>
      <WelcomeModal />

      <div className="mx-auto w-full max-w-7xl">
        {/* =========================================================================
            HERO SECTION — Authentic South Indian Culinary Heritage & Official Tagline
            ========================================================================= */}
        <section className="relative overflow-hidden pt-4 pb-8 sm:py-10 md:py-12">
          {/* Subtle warm background glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-full -translate-x-1/2 rounded-full bg-gradient-to-b from-[#FCE4E4]/60 via-[#FAF6EF] to-transparent blur-3xl" />

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Left Column: Brand Copy & Core Actions */}
              <div className="lg:col-span-7">
                {/* Official Tagline Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#9B2C2C]/20 bg-[#FCE4E4] px-3.5 py-1 text-xs font-semibold text-[#9B2C2C] shadow-xs">
                  <Heart className="h-3.5 w-3.5 fill-[#9B2C2C]" />
                  <span>“Safe, as your mother's home.”</span>
                </div>

                {/* Main Heading */}
                <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#1C1917] sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                  {user ? (
                    <>
                      Welcome back,{' '}
                      <span className="text-[#9B2C2C]">{firstName}</span>.
                      <br />
                      <span className="font-normal italic text-[#44403C] text-2xl sm:text-3xl lg:text-4xl">
                        Fresh homemade flavours, daily.
                      </span>
                    </>
                  ) : (
                    <>
                      Authentic homemade taste,
                      <br />
                      <span className="text-[#9B2C2C]">prepared with maternal care.</span>
                    </>
                  )}
                </h1>

                {/* Narrative Subtitle */}
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#44403C] sm:text-base">
                  Handcrafted South Indian pickles, sun-roasted spices, and healthy weekly meal subscriptions. Prepared in small batches with pure cold-pressed oils, authentic heritage recipes, and zero chemical preservatives.
                </p>

                {/* Trust Highlights Strip */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#E6D9C5] py-3.5 text-left">
                  <div>
                    <p className="font-serif text-xs font-bold text-[#1C1917] sm:text-sm">
                      Cold-Pressed Oils
                    </p>
                    <p className="text-[11px] text-[#78716C] leading-snug">Pure gingelly & groundnut</p>
                  </div>
                  <div>
                    <p className="font-serif text-xs font-bold text-[#1C1917] sm:text-sm">
                      Sun-Cured Spices
                    </p>
                    <p className="text-[11px] text-[#78716C] leading-snug">Stone-ground slowly</p>
                  </div>
                  <div>
                    <p className="font-serif text-xs font-bold text-[#1C1917] sm:text-sm">
                      Zero Preservatives
                    </p>
                    <p className="text-[11px] text-[#78716C] leading-snug">100% natural ingredients</p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#menu"
                    className="inline-flex items-center gap-2 rounded-md bg-[#9B2C2C] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#7B1F23] hover:shadow focus:ring-2 focus:ring-[#9B2C2C]/30 active:scale-95"
                  >
                    <span>Explore Our Pickles & Menu</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>

                  <Link
                    to="/subscription"
                    className="inline-flex items-center gap-2 rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-5 py-3 text-sm font-semibold text-[#1C1917] shadow-xs transition-all duration-150 hover:border-[#9B2C2C]/40 hover:bg-[#FDF2F2] hover:text-[#9B2C2C] active:scale-95"
                  >
                    <span>Weekly Meal Plans</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Authentic Brand Heritage Emblem Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm rounded-2xl border border-[#E6D9C5] bg-gradient-to-b from-[#FFFEFC] via-[#FAF6EF] to-[#F3EBDD] p-6 shadow-md text-center">
                  {/* Subtle red ribbon accent */}
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#FAF6EF] p-2 ring-4 ring-[#9B2C2C]/10 shadow-inner">
                    <img
                      src={logo}
                      alt="Manoharam Real Foods Official Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-4 font-serif text-xl font-bold tracking-tight text-[#1C1917]">
                    Manoharam Real Foods
                  </p>
                  <p className="font-serif text-sm italic text-[#9B2C2C] mt-1 font-medium">
                    “Safe, as your mother's home.”
                  </p>

                  <div className="mt-5 rounded-xl border border-[#E6D9C5]/80 bg-[#FFFEFC]/80 p-3.5 text-xs text-[#44403C] space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#15803D] shrink-0" />
                      <span>Prepared in small traditional batches</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#D97706] shrink-0" />
                      <span>Slow-fermented in ceramic martabans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-[#9B2C2C] shrink-0" />
                      <span>Everyday safety and homely hygiene</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            ACTIVE SUBSCRIPTION & TODAY'S DELIVERY STATUS
            ========================================================================= */}
        <div className="px-4 sm:px-6 lg:px-8">
          <TodayDeliveryBanner />
          <SubscriptionSection />
        </div>

        {/* =========================================================================
            BRAND HERITAGE & CRAFTSMANSHIP SECTION
            ========================================================================= */}
        <section className="my-10 border-y border-[#E6D9C5] bg-[#F3EBDD]/40 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B2C2C]">
              Our Heritage Promise
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-[#1C1917] sm:text-3xl">
              “Safe, as your mother's home.”
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-[#78716C] leading-relaxed">
              In traditional South Indian homes, pickling and cooking were sacred culinary arts. We continue that legacy with pure ingredients and time-honoured patience.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
              <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FCE4E4] text-[#9B2C2C]">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-serif text-base font-bold text-[#1C1917]">
                  Time-Honoured Recipes
                </h3>
                <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
                  Passed down through generations, slow-fermented in ceramic jars with traditional aromatic spices.
                </p>
              </div>

              <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF7DA] text-[#D97706]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-serif text-base font-bold text-[#1C1917]">
                  Pure Cold-Pressed Oils
                </h3>
                <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
                  Prepared using 100% natural wood-pressed sesame (gingelly) and groundnut oils — never refined or bleached.
                </p>
              </div>

              <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#15803D]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 font-serif text-base font-bold text-[#1C1917]">
                  Natural Preservation
                </h3>
                <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
                  Gently sun-cured with rock salt, natural turmeric, and cold-pressed oil. Completely free from artificial preservatives.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            À LA CARTE PRODUCTS & PICKLES CATALOG
            ========================================================================= */}
        <section id="menu" className="mt-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#9B2C2C]">
                À La Carte Selection
              </span>
              <h2 className="mt-0.5 font-serif text-2xl font-bold text-[#1C1917] sm:text-3xl">
                Traditional Pickles & Delicacies
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#78716C]">
                Order individual jars whenever you like — delivered fresh to your doorstep.
              </p>
            </div>

            {/* Quick Search trigger link */}
            <Link
              to="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9B2C2C] hover:text-[#7B1F23]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search products</span>
            </Link>
          </div>

          {/* Category Filter Tabs */}
          {categories.length > 1 ? (
            <div className="scrollbar-none mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-md px-4 py-2 text-xs font-bold transition-all duration-150 ${
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

          {/* Products State Handling */}
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
                  <p className="text-xs text-[#78716C]">Please check your network and try again.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#9B2C2C]/30 bg-white px-4 py-2 text-xs font-bold text-[#9B2C2C] shadow-xs hover:bg-[#9B2C2C] hover:text-white transition-colors"
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
              <p className="text-xs text-[#78716C]">Check back soon or explore other categories.</p>
            </div>
          ) : (
            <>
              {/* Product Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
              <div className="mt-6 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productsQuery.hasNextPage ? (
                <div className="mt-6 flex justify-center pb-4">
                  <button
                    onClick={() => productsQuery.fetchNextPage()}
                    disabled={productsQuery.isFetchingNextPage}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-6 py-2.5 text-xs font-bold text-[#1C1917] shadow-xs hover:border-[#9B2C2C]/30 hover:bg-[#FDF2F2] hover:text-[#9B2C2C] disabled:opacity-60 transition-all"
                  >
                    {productsQuery.isFetchingNextPage ? (
                      'Loading more…'
                    ) : (
                      <>
                        <span>Load more products</span>
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </AppShell>
  )
}

function ProductsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#E6D9C5] bg-white p-3 shadow-xs">
          <div className="aspect-square w-full animate-pulse rounded-lg bg-[#F3EBDD]" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-[#F3EBDD]" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-[#F3EBDD]" />
          </div>
        </div>
      ))}
    </div>
  )
}