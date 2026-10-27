import { useMemo, useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, ChevronDown, ShoppingBag } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductCard from '../components/ProductCard'
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
    queryKey: ['products', 'search', debouncedTerm, selectedCategory, minPrice, maxPrice],
    queryFn: ({ pageParam }) =>
      searchProducts({
        search: debouncedTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        cursor: pageParam,
        limit: 12,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.has_more ? lastPage.pagination.next_cursor : undefined,
  })

  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page) => page.products) ?? [],
    [searchQuery.data]
  )

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Discover Our Delicacies" />

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        {/* Search & Filter Inputs */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-[#E6D9C5] bg-[#FFFEFC] px-3.5 py-2.5 shadow-xs focus-within:border-[#9B2C2C] focus-within:ring-1 focus-within:ring-[#9B2C2C]">
            <SearchIcon className="h-4 w-4 text-[#78716C] shrink-0" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search pickles, thokkus, powders, meals..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-[#1C1917] outline-none placeholder:text-[#A8A29E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 rounded-lg border border-[#E6D9C5] bg-[#FFFEFC] px-3 py-2 text-xs text-[#1C1917] outline-none placeholder:text-[#A8A29E] focus:border-[#9B2C2C]"
            />
            <span className="text-xs text-[#78716C]">—</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 rounded-lg border border-[#E6D9C5] bg-[#FFFEFC] px-3 py-2 text-xs text-[#1C1917] outline-none placeholder:text-[#A8A29E] focus:border-[#9B2C2C]"
            />
          </div>
        </div>

        {/* Category filter tabs */}
        {categories.length > 1 ? (
          <div className="scrollbar-none mt-4 flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-md px-3.5 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#9B2C2C] text-white shadow-xs'
                    : 'border border-[#E6D9C5] bg-[#FFFEFC] text-[#44403C] hover:border-[#9B2C2C]/30 hover:bg-[#FAF6EF]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        {/* Search Results */}
        <div className="mt-6">
          {searchQuery.isLoading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
              <p className="mt-3 text-xs font-semibold text-[#78716C]">Searching our kitchen…</p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-[#E6D9C5] bg-[#FFFEFC] px-6 py-16 text-center max-w-md mx-auto">
              <ShoppingBag className="mx-auto h-8 w-8 text-[#A8A29E]" />
              <h2 className="mt-3 font-serif text-lg font-bold text-[#1C1917]">
                No matching delicacies found
              </h2>
              <p className="mt-1 text-xs text-[#78716C]">
                Try adjusting your search terms or clearing price filters.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-[#78716C] mb-4">
                Found {results.length} delicacy{results.length === 1 ? '' : 'ies'}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {searchQuery.hasNextPage ? (
                <div className="mt-8 flex justify-center pb-6">
                  <button
                    onClick={() => searchQuery.fetchNextPage()}
                    disabled={searchQuery.isFetchingNextPage}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#E6D9C5] bg-[#FFFEFC] px-6 py-2.5 text-xs font-bold text-[#1C1917] shadow-xs hover:border-[#9B2C2C]/30 hover:bg-[#FAF6EF] transition-all"
                  >
                    {searchQuery.isFetchingNextPage ? (
                      'Loading…'
                    ) : (
                      <>
                        <span>Load more results</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </AppShell>
  )
}
