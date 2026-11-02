import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Sparkles, Search, Package, Filter } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge, { toneForStatus, formatStatusLabel } from '../components/ui/Badge'
import ProductImage from '../components/ui/ProductImage'
import EmptyState from '../components/ui/EmptyState'
import CreateProductModal from '../components/products/CreateProductModal'
import CreatePlanWizardModal from '../components/subscriptions/CreatePlanWizardModal'
import { useCursorList } from '../hooks/useCursorList'
import { listProducts } from '../api/products'

export default function Products() {
  const {
    items: products,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCursorList({
    queryKey: ['products'],
    queryFn: listProducts,
    itemsKey: 'products',
  })

  const queryClient = useQueryClient()
  const [createProductOpen, setCreateProductOpen] = useState(false)
  const [createPlanOpen, setCreatePlanOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [saleFilter, setSaleFilter] = useState('ALL')

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set)
  }, [products])

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)

      const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter

      const matchesSale =
        saleFilter === 'ALL' ||
        (saleFilter === 'SUBSCRIPTION_ONLY' && p.is_subscription_only) ||
        (saleFilter === 'STOREFRONT' && !p.is_subscription_only)

      return matchesSearch && matchesCat && matchesSale
    })
  }, [products, searchQuery, categoryFilter, saleFilter])

  return (
    <DashboardShell>
      <PageHeader
        title="Products & Grocery Catalog"
        description="Manage handcrafted pickles, stone-ground masalas, and subscription meal delicacies."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => setCreatePlanOpen(true)}
              className="text-xs sm:text-sm"
            >
              <Sparkles className="h-4 w-4 text-chili-600" />
              <span>Create Meal Plan</span>
            </Button>
            <Button
              onClick={() => setCreateProductOpen(true)}
              className="text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Product</span>
            </Button>
          </div>
        }
      />

      {/* SEARCH & FILTERS BAR */}
      <div className="mb-6 rounded-2xl border border-cream-200 bg-white p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search products by name, recipe keywords, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-cream-300 bg-cream-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-ink-900 outline-none focus:border-chili-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 outline-none focus:border-chili-500"
            >
              <option value="ALL">All Categories ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={saleFilter}
              onChange={(e) => setSaleFilter(e.target.value)}
              className="rounded-xl border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 outline-none focus:border-chili-500"
            >
              <option value="ALL">All Product Types</option>
              <option value="STOREFRONT">Storefront Retail Only</option>
              <option value="SUBSCRIPTION_ONLY">Subscription Delicacies Only</option>
            </select>
          </div>
        </div>

        {/* Quick Results Summary */}
        <div className="flex items-center justify-between text-xs text-ink-500 pt-1 border-t border-cream-100">
          <span>
            Showing <strong className="text-ink-900 font-semibold">{filteredProducts.length}</strong> of{' '}
            {products.length} products
          </span>
          {searchQuery || categoryFilter !== 'ALL' || saleFilter !== 'ALL' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('ALL')
                setSaleFilter('ALL')
              }}
              className="text-xs font-bold text-chili-600 hover:underline"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-white border border-cream-200 animate-pulse p-4 space-y-3"
            >
              <div className="h-32 rounded-xl bg-cream-200" />
              <div className="h-4 w-3/4 rounded bg-cream-200" />
              <div className="h-3 w-1/2 rounded bg-cream-100" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-10 text-center text-chili-600">
          <p className="font-semibold text-sm">Could not load products.</p>
          <p className="text-xs text-ink-500 mt-1">Check backend database and API server connectivity.</p>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title={searchQuery ? 'No products match your search' : 'No products in catalog yet'}
          description={
            searchQuery
              ? 'Try modifying your search keywords or clearing active filters.'
              : 'Add your first artisanal pickle, meal salad, or spice blend to start taking orders.'
          }
          actionLabel={searchQuery ? 'Clear Filters' : 'Create First Product'}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('')
              setCategoryFilter('ALL')
              setSaleFilter('ALL')
            } else {
              setCreateProductOpen(true)
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="group">
              <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-cream-400 group-hover:-translate-y-0.5">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-100">
                  <ProductImage
                    src={product.image_url}
                    alt={product.name}
                    category={product.category}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  />
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                    <Badge tone={toneForStatus(product.status)}>
                      {formatStatusLabel(product.status)}
                    </Badge>
                  </div>

                  {product.is_subscription_only ? (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-900/85 px-2 py-0.5 text-[10px] font-bold text-cream-50 backdrop-blur-xs shadow-xs">
                        <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                        Subscription Dish
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      {product.category || 'General'}
                    </p>
                    <h3 className="font-display text-sm font-bold text-ink-950 group-hover:text-chili-600 transition-colors line-clamp-2 mt-0.5">
                      {product.name}
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-cream-100 flex items-baseline justify-between">
                    <div>
                      {Number(product.selling_price) > 0 ? (
                        <p className="font-display text-base font-bold text-chili-600">
                          ₹{Number(product.selling_price).toFixed(0)}
                          <span className="text-[11px] font-normal text-ink-400 ml-0.5">
                            / unit
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-amber-700">
                          Plan-Only Dish
                        </p>
                      )}
                    </div>

                    <span className="text-[11px] font-semibold text-ink-600 bg-cream-100 px-2 py-0.5 rounded-md">
                      {product.quantity} {product.unit}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Load More */}
      {hasNextPage ? (
        <div className="mt-8 text-center">
          <Button
            variant="secondary"
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            className="min-w-[160px]"
          >
            Load More Products
          </Button>
        </div>
      ) : null}

      {/* Complete Redesigned Modals */}
      <CreateProductModal
        open={createProductOpen}
        onClose={() => setCreateProductOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['products'] })
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
        }}
      />

      <CreatePlanWizardModal
        open={createPlanOpen}
        onClose={() => setCreatePlanOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
          queryClient.invalidateQueries({ queryKey: ['products'] })
        }}
      />
    </DashboardShell>
  )
}