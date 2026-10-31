import { useMemo, useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'
import { searchProducts, listCategories } from '../api/products'

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timeout)
  }, [value, delayMs])
  return debounced
}

export default function SearchPage() {
  const [term, setTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'DIRECT' | 'SUBSCRIPTION'
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const debouncedTerm = useDebouncedValue(term)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
  })

  const categories = useMemo(() => {
    const cats = categoriesQuery.data?.categories?.map((c) => c.category) || []
    return ['All', ...cats]
  }, [categoriesQuery.data])

  const searchQuery = useInfiniteQuery({
    queryKey: ['products', 'search', debouncedTerm, selectedCategory, minPrice, maxPrice, filterType],
    queryFn: ({ pageParam }) =>
      searchProducts({
        search: debouncedTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        cursor: pageParam,
        limit: 12,
        subscriptionOnly: filterType === 'SUBSCRIPTION' ? true : undefined,
        forSaleOnly: filterType === 'DIRECT' ? true : undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.has_more ? lastPage.pagination.next_cursor : undefined,
  })

  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page) => page.products) ?? [],
    [searchQuery.data]
  )

  const hasActiveFilters = Boolean(
    term || selectedCategory !== 'All' || filterType !== 'ALL' || minPrice || maxPrice
  )

  const handleResetFilters = () => {
    setTerm('')
    setSelectedCategory('All')
    setFilterType('ALL')
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Discover Our Delicacies" />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 shadow-xs focus-within:border-chili-500 focus-within:ring-2 focus-within:ring-chili-500/20 transition-all">
            <SearchIcon className="h-5 w-5 text-ink-400 shrink-0" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search pickles, thokkus, podis, meal boxes..."
              className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
            />
            {term ? (
              <button
                type="button"
                onClick={() => setTerm('')}
                className="text-ink-400 hover:text-ink-700"
                aria-label="Clear search input"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-2xl border border-cream-300 bg-cream-50 px-3 py-2 shadow-xs focus-within:border-chili-500">
              <span className="text-xs text-ink-400 mr-1.5 font-bold">₹</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-16 bg-transparent text-xs text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
            <span className="text-xs text-ink-400">—</span>
            <div className="flex items-center rounded-2xl border border-cream-300 bg-cream-50 px-3 py-2 shadow-xs focus-within:border-chili-500">
              <span className="text-xs text-ink-400 mr-1.5 font-bold">₹</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-16 bg-transparent text-xs text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-ink-500 hover:text-chili-600 text-xs shrink-0"
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {/* Filter Pills & Category Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 pb-4">
          <div className="flex items-center gap-1.5 rounded-full border border-cream-300 bg-cream-50 p-1 shadow-xs">
            {[
              { id: 'ALL', label: 'All Items' },
              { id: 'DIRECT', label: 'Direct Sale' },
              { id: 'SUBSCRIPTION', label: 'Subscription Only' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id)}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                  filterType === f.id
                    ? 'bg-chili-600 text-cream-50 shadow-xs'
                    : 'text-ink-700 hover:bg-cream-100 hover:text-ink-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {categories.length > 1 ? (
            <div className="scrollbar-none flex gap-1.5 overflow-x-auto py-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-ink-900 text-cream-50 shadow-xs'
                      : 'border border-cream-300 bg-cream-50 text-ink-700 hover:bg-cream-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Search Results */}
        <div>
          {searchQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="No matching delicacies found"
              description="We could not find any products matching your current search terms or price filters. Try searching for pickles, podis, or adjusting your filters."
              actionLabel="Clear All Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <p className="text-xs font-semibold text-ink-500 mb-4">
                Found {results.length} delicacy{results.length === 1 ? '' : 'ies'} prepared with pure ingredients
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {searchQuery.hasNextPage ? (
                <div className="mt-8 flex justify-center pb-6">
                  <Button
                    variant="outline"
                    onClick={() => searchQuery.fetchNextPage()}
                    disabled={searchQuery.isFetchingNextPage}
                    loading={searchQuery.isFetchingNextPage}
                    className="min-w-[200px]"
                  >
                    <span>Load More Results</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
