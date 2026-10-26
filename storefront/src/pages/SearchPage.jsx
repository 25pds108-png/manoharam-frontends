import { useMemo, useState, useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { Search as SearchIcon } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductCard from '../components/ProductCard'
import { searchProducts, listCategories } from '../api/products'

function useDebouncedValue(value, delayMs = 350) {
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
    <AppShell>
      <PageHeader title="Search" />

      <div className="px-4">
        <div className="flex flex-col gap-3 md:max-w-2xl md:flex-row">
          <div className="flex items-center gap-2 rounded-pill bg-white px-4 py-3 shadow-sm shadow-ink-900/5 md:flex-1">
            <SearchIcon className="h-4 w-4 text-ink-300" />
            <input
              autoFocus
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search bowls, masalas, pickles..."
              className="flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 rounded-pill bg-white px-4 py-2 text-sm outline-none placeholder:text-ink-300 md:w-32"
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 rounded-pill bg-white px-4 py-2 text-sm outline-none placeholder:text-ink-300 md:w-32"
            />
          </div>
        </div>

        {/* Category filter chips */}
        {categories.length > 1 ? (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-pill px-3.5 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-chili-500 text-cream-50'
                    : 'bg-white text-ink-700 hover:bg-cream-100 shadow-sm shadow-ink-900/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {searchQuery.isLoading ? (
          <p className="py-8 text-center text-ink-300">Searching…</p>
        ) : null}

        {!searchQuery.isLoading && results.length === 0 ? (
          <p className="py-8 text-center text-ink-300">
            {term ? `No results for "${term}".` : 'Start typing to search.'}
          </p>
        ) : null}

        {searchQuery.hasNextPage ? (
          <button
            onClick={() => searchQuery.fetchNextPage()}
            disabled={searchQuery.isFetchingNextPage}
            className="mb-4 w-full rounded-pill bg-white py-3 text-sm font-semibold text-chili-500 shadow-sm shadow-ink-900/5"
          >
            {searchQuery.isFetchingNextPage ? 'Loading more…' : 'Load more'}
          </button>
        ) : null}
      </div>
    </AppShell>
  )
}
