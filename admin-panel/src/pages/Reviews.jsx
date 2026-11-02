import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, MessageSquare, X, CheckCircle2, Filter } from 'lucide-react'
import DashboardShell from '../components/layout/DashboardShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { listProducts } from '../api/products'
import { getProductReviews, moderateReview } from '../api/reviews'

export default function Reviews() {
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [rejectDialog, setRejectDialog] = useState({ open: false, reviewId: null })
  const [actionNotice, setActionNotice] = useState('')

  // 1. Fetch products list so admin can select which product's reviews to inspect/moderate
  const productsQuery = useQuery({
    queryKey: ['admin', 'products-for-reviews'],
    queryFn: () => listProducts({ limit: 100 }),
    onSuccess: (data) => {
      if (!selectedProductId && data?.products?.length > 0) {
        setSelectedProductId(data.products[0].id)
      }
    },
  })

  // 2. Fetch reviews for selected product
  const reviewsQuery = useQuery({
    queryKey: ['admin', 'product-reviews', selectedProductId],
    queryFn: () => getProductReviews(selectedProductId),
    enabled: !!selectedProductId,
  })

  // 3. Moderate review mutation
  const moderateMutation = useMutation({
    mutationFn: moderateReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product-reviews', selectedProductId] })
      setRejectDialog({ open: false, reviewId: null })
      setActionNotice('Review status updated successfully.')
      setTimeout(() => setActionNotice(''), 3500)
    },
  })

  const confirmReject = () => {
    if (!rejectDialog.reviewId) return
    moderateMutation.mutate({ reviewId: rejectDialog.reviewId, status: 'REJECTED' })
  }

  const products = productsQuery.data?.products ?? []
  const reviewsData = reviewsQuery.data
  const reviews = reviewsData?.reviews ?? []
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  return (
    <DashboardShell>
      <PageHeader
        title="Product Reviews & Moderation"
        description="Inspect customer ratings, review comments, and approve or reject feedback before public display."
      />

      {actionNotice ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-forest-50 p-3.5 text-xs font-semibold text-forest-800 border border-forest-200">
          <CheckCircle2 className="h-4 w-4 text-forest-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      ) : null}

      {/* Mobile-Friendly Product Selector (< lg) */}
      <div className="mb-4 block lg:hidden">
        <label className="mb-1.5 block text-xs font-semibold text-ink-700">
          Select Product to Moderate:
        </label>
        <select
          value={selectedProductId || ''}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
          className="w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-900 outline-none focus:border-chili-400 shadow-2xs"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Product Selection Desktop Sidebar (lg+) */}
        <Card className="hidden lg:block p-4 lg:col-span-1 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-3">
            Products ({products.length})
          </h2>
          {productsQuery.isLoading ? (
            <p className="text-xs text-ink-300 py-4 text-center">Loading products…</p>
          ) : (
            <div className="space-y-1">
              {products.map((p) => {
                const isSelected = p.id === selectedProductId
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-chili-50 text-chili-600 font-semibold'
                        : 'text-ink-700 hover:bg-cream-100'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <span className="text-[10px] text-ink-400 shrink-0 ml-2">{p.category}</span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Reviews Feed for Selected Product */}
        <div className="lg:col-span-3 space-y-6">
          {reviewsQuery.isLoading ? (
            <Card className="p-12 text-center text-sm text-ink-300">
              Loading reviews for selected product…
            </Card>
          ) : !selectedProductId ? (
            <Card className="p-12 text-center text-sm text-ink-400">
              Please select a product above to inspect customer reviews.
            </Card>
          ) : (
            <>
              {/* Product Rating Header Card */}
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-900">
                      {selectedProduct?.name || 'Selected Product'}
                    </h2>
                    <p className="text-xs text-ink-400 mt-0.5">
                      {selectedProduct?.category} · Verified customer feedback
                    </p>
                  </div>
                  <div className="flex items-center gap-3 bg-cream-50 px-4 py-2 rounded-xl border border-cream-200 shrink-0">
                    <div className="flex items-center gap-1.5 text-warning-500">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-display text-xl font-bold text-ink-900">
                        {reviewsData?.average_rating ?? '0.0'}
                      </span>
                    </div>
                    <span className="text-xs text-ink-400 font-medium">
                      ({reviewsData?.total_reviews ?? 0} published reviews)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <Card className="p-10">
                    <EmptyState
                      icon={MessageSquare}
                      title="No reviews published yet"
                      description="When customers leave ratings and feedback on the storefront, reviews will appear here for moderation."
                    />
                  </Card>
                ) : (
                  reviews.map((rev) => (
                    <Card key={rev.id} className="p-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 border-b border-cream-100 pb-3">
                        <div>
                          <div className="flex items-center gap-1 text-warning-500 mb-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-4 w-4 ${
                                  s <= rev.rating ? 'fill-current' : 'text-cream-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-bold text-ink-900 ml-1.5">
                              {rev.rating} / 5
                            </span>
                          </div>
                          <h3 className="font-semibold text-ink-900 text-sm">
                            {rev.review_title || 'Customer Review'}
                          </h3>
                        </div>
                        <div className="text-left sm:text-right text-xs">
                          <p className="font-semibold text-ink-900">{rev.reviewer_name}</p>
                          <p className="text-ink-400 text-[11px]">
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-IN') : '—'}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-ink-700 leading-relaxed">
                        {rev.review_text}
                      </p>

                      <div className="pt-2 border-t border-cream-100 flex items-center justify-between">
                        <Badge tone="forest">APPROVED</Badge>
                        <button
                          onClick={() => setRejectDialog({ open: true, reviewId: rev.id })}
                          disabled={moderateMutation.isLoading}
                          className="inline-flex items-center gap-1.5 rounded-pill bg-cream-200 px-3.5 py-1.5 text-xs font-semibold text-chili-600 hover:bg-chili-50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" /> Reject & Hide
                        </button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Moderation Confirm Dialog */}
      <ConfirmDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, reviewId: null })}
        onConfirm={confirmReject}
        title="Reject and Hide Review"
        message="Are you sure you want to reject this review? It will be removed from the public storefront."
        confirmText="Yes, Reject Review"
        variant="danger"
        loading={moderateMutation.isLoading}
      />
    </DashboardShell>
  )
}
