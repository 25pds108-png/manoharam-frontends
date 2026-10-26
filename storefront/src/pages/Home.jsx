import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Leaf,
  Quote,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  PlayCircle,
  Dumbbell,
  Heart,
  Bike,
  Clock3,
  ShieldCheck,
  Home as HomeIcon,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import AppShell from "../components/layout/AppShell";
import ProductCard from "../components/ProductCard";
import SubscriptionSection from "../components/SubscriptionSection";
import TodayDeliveryBanner from "../components/TodayDeliveryBanner";
import WelcomeModal from "../components/WelcomeModal";
import { listProducts, listCategories } from "../api/products";
import { useAuth } from "../context/AuthContext";

/**
 * Small four-point sparkle/twinkle accent used around the tagline card —
 * a hand-placed decorative mark, not an icon from the library.
 */
function Sparkle({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 0 C12 6.5 13.5 8 20 9 C13.5 10 12 11.5 12 18 C12 11.5 10.5 10 4 9 C10.5 8 12 6.5 12 0 Z" />
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const productsQuery = useInfiniteQuery({
    queryKey: ["products", "list"],
    queryFn: ({ pageParam }) => listProducts({ cursor: pageParam, limit: 12 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.has_more
        ? lastPage.pagination.next_cursor
        : undefined,
  });

  const allProducts = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.products) ?? [],
    [productsQuery.data],
  );

  const categories = useMemo(() => {
    const backendCategories =
      categoriesQuery.data?.categories?.map((c) => c.category) || [];
    const productCategories = allProducts.map((p) => p.category).filter(Boolean);
    const combined = Array.from(new Set([...backendCategories, ...productCategories]));
    return ["All", ...combined];
  }, [categoriesQuery.data, allProducts]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return allProducts;
    return allProducts.filter((p) => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  const firstName = user?.name?.split(" ")[0];

  return (
    <AppShell>
      <WelcomeModal />

      {/* Caps overall width on very large / ultra-wide screens so content
          doesn't stretch edge-to-edge indefinitely; centers once it hits
          the cap. Hero and content below share this same outer bound so
          their side margins line up at every breakpoint. */}
      <div className="mx-auto w-full max-w-7xl">
        {/* ===== MOBILE HERO (< sm) — bleeding image + overlapping search ===== */}
        <div className="sm:hidden">
          <div className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-chili-500 to-chili-600 pb-14 pt-5 text-cream-50 shadow-lg shadow-chili-900/10">
            <div className="px-4">
              <Link
                to="/address"
                className="flex w-fit items-center gap-1.5 rounded-pill bg-cream-50/10 px-3 py-1.5 text-sm opacity-90 ring-1 ring-inset ring-cream-50/25"
              >
                <MapPin className="h-3.5 w-3.5" />
                Set your delivery address
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="relative mt-4 px-4">
              <h1 className="font-display leading-tight">
                {user ? (
                  <>
                    <span className="block text-xl font-semibold">
                      Welcome back,
                    </span>
                    <span className="mt-0.5 block text-3xl font-bold text-amber-300">
                      {firstName} 👋
                    </span>
                  </>
                ) : (
                  <span className="block text-2xl font-semibold">
                    Fresh today,
                    <br /> from our kitchen.
                  </span>
                )}
              </h1>
              <p className="mt-2 max-w-[80%] text-xs text-cream-50/85">
                {user
                  ? "Fresh bowls. Real ingredients. Made for your everyday wellness."
                  : "Real ingredients, honestly made — order à la carte or subscribe for daily delivery."}
              </p>

              {/* Brand tagline — set apart from the body copy above it as
                  its own signature line, not another sentence of text. */}
              <div className="mt-4 flex items-start gap-2">
                <Quote
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 fill-amber-300/90 text-amber-300/90"
                />
                <p className="font-display text-base italic leading-snug tracking-wide text-amber-300">
                  Safe, as your Mother's Home!
                </p>
              </div>
            </div>
          </div>

          {/* Search bar overlaps the hero's bottom edge — sits as its own
              sibling (not nested in the hero) so the hero's overflow-hidden
              (used to crop/round the image) doesn't clip it. */}
          <div className="relative z-10 -mt-7 px-4">
            <Link
              to="/search"
              className="flex items-center gap-3 rounded-pill bg-cream-50 px-4 py-3.5 text-ink-300 shadow-lg shadow-ink-900/15"
            >
              <Search className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left text-sm">
                Search bowls, masalas, pickles...
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-100 text-ink-500">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* ===== DESKTOP / TABLET HERO (sm+) — matches the reference layout:
            light left column with copy + feature chips + CTAs + a perks
            strip, and a right column where the dish photo bleeds into a
            diagonal red panel with an overlapping "Mother's Home" card. ===== */}
        <div className="hidden sm:block">
          <div className="px-6 pt-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
              {/* ---- Left: copy, feature chips, CTAs, perks strip ---- */}
              <div>
                <Link
                  to="/address"
                  className="inline-flex items-center gap-1.5 rounded-pill border border-chili-200 bg-white px-4 py-2 text-sm font-medium text-chili-600 shadow-sm shadow-ink-900/5"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Set your delivery address
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>

                <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] text-ink-900 lg:text-5xl">
                  {user ? (
                    <>
                      Welcome back,
                      <br />
                      <span className="relative inline-block text-chili-500">
                        {firstName}
                        <svg
                          aria-hidden
                          viewBox="0 0 120 12"
                          className="absolute -bottom-1.5 left-0 h-2.5 w-full text-chili-500"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M2 8 Q 60 2 118 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>{" "}
                      👋
                    </>
                  ) : (
                    <>
                      Fresh today,
                      <br /> from our kitchen.
                    </>
                  )}
                </h1>

                <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-500">
                  {user
                    ? "Fresh bowls. Real ingredients. Made for your everyday wellness."
                    : "Real ingredients, honestly made — order à la carte or subscribe for daily delivery."}
                </p>

                {/* Feature chips */}
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Leaf className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-medium leading-tight text-ink-700">
                      Clean
                      <br />
                      Ingredients
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili-50 text-chili-500">
                      <Dumbbell className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-medium leading-tight text-ink-700">
                      High
                      <br />
                      Protein
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-500">
                      <Heart className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-medium leading-tight text-ink-700">
                      No Maida
                      <br />
                      No Junk
                    </span>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-7 flex items-center gap-3">
                  <a
                    href="#menu"
                    className="inline-flex items-center gap-2 rounded-pill bg-chili-500 px-6 py-3.5 text-sm font-semibold text-cream-50 shadow-md shadow-chili-900/20 transition-colors duration-200 hover:bg-chili-600"
                  >
                    Explore Menu
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-pill bg-white px-6 py-3.5 text-sm font-semibold text-ink-900 shadow-sm ring-1 ring-ink-900/[0.08] transition-colors duration-200 hover:bg-cream-100"
                  >
                    <PlayCircle className="h-4 w-4" />
                    How It Works
                  </button>
                </div>

                {/* Perks strip */}
                <div className="mt-7 grid grid-cols-3 divide-x divide-ink-900/[0.06] rounded-2xl border border-ink-900/[0.06] bg-white/60 py-4">
                  <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                    <Bike className="h-5 w-5 text-chili-500" />
                    <span className="text-xs font-medium leading-tight text-ink-700">
                      Freshly
                      <br />
                      Prepared
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                    <Clock3 className="h-5 w-5 text-chili-500" />
                    <span className="text-xs font-medium leading-tight text-ink-700">
                      On-time
                      <br />
                      Delivery
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                    <ShieldCheck className="h-5 w-5 text-chili-500" />
                    <span className="text-xs font-medium leading-tight text-ink-700">
                      Hygienic
                      <br />& Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* ---- Right: tagline card, standing on its own ---- */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md rounded-[1.75rem] bg-gradient-to-br from-chili-500 to-chili-600 p-7 text-cream-50 shadow-lg shadow-chili-900/25 lg:p-8">
                  {/* Decorative sparkles — hand-placed accents, not a repeating pattern */}
                  <Sparkle className="absolute left-8 top-5 h-3.5 w-3.5 text-amber-300/70" />
                  <Sparkle className="absolute right-9 top-16 h-2.5 w-2.5 text-amber-300/50" />
                  <Sparkle className="absolute bottom-24 right-7 h-4 w-4 text-amber-300/60" />

                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cream-50 text-chili-500 shadow-sm">
                    <Heart className="h-5.5 w-5.5 fill-chili-500" />
                  </span>

                  <p className="relative mt-4 font-display text-2xl leading-snug lg:text-[1.75rem]">
                    <span className="font-semibold not-italic">Safe, as your</span>
                    <br />
                    <span className="relative inline-block italic text-amber-300">
                      Mother's Home!
                      <svg
                        aria-hidden
                        viewBox="0 0 180 14"
                        className="absolute -bottom-1.5 left-0 h-3 w-full text-amber-300"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M2 9 Q 45 3 90 8 T 178 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </p>

                  <div className="relative mt-6 grid grid-cols-3 divide-x divide-cream-50/20 border-t border-cream-50/20 pt-4">
                    <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 text-chili-500">
                        <ShieldCheck className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-medium leading-tight opacity-90">
                        Trusted
                        <br />
                        Ingredients
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 text-chili-500">
                        <HomeIcon className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-medium leading-tight opacity-90">
                        Homely
                        <br />
                        Taste
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 px-1 text-center">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-50 text-chili-500">
                        <Heart className="h-4.5 w-4.5" />
                      </span>
                      <span className="text-xs font-medium leading-tight opacity-90">
                        Made with
                        <br />
                        Care
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 px-4 sm:mt-6 sm:px-6 lg:px-8">
          <TodayDeliveryBanner />
          {/* Subscription: subscribable plans when the user has none, or a
              compact manage-banner once they have a PENDING/ACTIVE one */}
          <SubscriptionSection />

          {/* À la carte section — its own heading makes it clear these are
              one-off products to buy, not another subscription flow. */}
          <div className="mt-8">
            {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chili-500">À la carte</p> */}
            <h2 className="mt-1 font-display text-xl font-semibold text-ink-900">Order whenever you like</h2>
            <p className="mt-0.5 text-sm text-ink-500">No subscription — just pick what you want, today</p>
          </div>

          {/* Category chips */}
          {categories.length > 1 ? (
            <div className="scrollbar-none mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-chili-500 text-cream-50 shadow-sm shadow-chili-900/20"
                      : "bg-white text-ink-500 ring-1 ring-ink-900/[0.06] hover:text-ink-900 hover:ring-ink-900/15"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          {productsQuery.isLoading ? (
            <ProductsSkeleton />
          ) : productsQuery.isError ? (
            <div className="mt-4 flex flex-col items-start gap-3 rounded-card border border-dashed border-chili-200 bg-chili-50/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-chili-500 shadow-sm">
                  <AlertCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">Couldn't load products</p>
                  <p className="text-sm text-ink-500">Check your connection and try again.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => productsQuery.refetch()}
                className="flex shrink-0 items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-semibold text-chili-500 shadow-sm ring-1 ring-chili-200 transition-colors duration-200 hover:bg-chili-500 hover:text-cream-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-1.5 rounded-card bg-ink-900/[0.03] px-5 py-10 text-center">
              <ShoppingBag className="h-5 w-5 text-ink-300" />
              <p className="text-sm font-medium text-ink-500">
                {activeCategory === "All"
                  ? "No products yet"
                  : `No products in "${activeCategory}" yet`}
              </p>
              <p className="text-xs text-ink-300">Try another category, or check back soon</p>
            </div>
          ) : (
            <>
              {/* Product grid: 2 cols on phones, scaling up to 6 on large desktop */}
              <div className="mt-4 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {productsQuery.hasNextPage ? (
                <button
                  onClick={() => productsQuery.fetchNextPage()}
                  disabled={productsQuery.isFetchingNextPage}
                  className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-pill bg-white py-3 text-sm font-semibold text-chili-500 shadow-sm shadow-ink-900/5 ring-1 ring-ink-900/[0.04] transition-colors duration-200 hover:bg-chili-50 disabled:opacity-60 md:mx-auto md:w-auto md:px-8"
                >
                  {productsQuery.isFetchingNextPage ? (
                    "Loading more…"
                  ) : (
                    <>
                      Load more
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

/**
 * Card-shaped skeleton for the à la carte grid while products load.
 * Sized to a generic image + two-line layout — adjust if ProductCard's
 * real proportions differ.
 */
function ProductsSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-card bg-white shadow-sm shadow-ink-900/5">
          <div className="aspect-square w-full animate-pulse bg-ink-900/5" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 animate-pulse rounded-full bg-ink-900/5" />
            <div className="h-3 w-1/3 animate-pulse rounded-full bg-ink-900/5" />
          </div>
        </div>
      ))}
    </div>
  );
}