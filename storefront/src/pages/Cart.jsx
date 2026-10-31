import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShieldCheck, Ticket, ShoppingBag, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductImage from '../components/ProductImage'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { applyCoupon } from '../api/coupons'
import { getApiErrorMessage } from '../api/client'

export default function Cart() {
  const {
    items,
    totalAmount,
    isLoading,
    isError,
    updateQuantity,
    removeItem,
    clearCart,
    isClearing,
  } = useCart()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [busyProductId, setBusyProductId] = useState(null)

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState(null)

  const deliveryFee = 0 // Free delivery
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discount_amount || 0) : 0
  const grandTotal = Math.max(0, Number(totalAmount) - discountAmount + deliveryFee)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponError(null)
    setCouponLoading(true)
    try {
      const res = await applyCoupon({
        code: couponInput.trim(),
        orderAmount: Number(totalAmount),
      })
      if (res.success) {
        setAppliedCoupon(res)
        setCouponInput('')
        showToast(res.message || 'Coupon applied successfully!')
      } else {
        setCouponError(res.message || 'Invalid coupon code')
        showToast(res.message || 'Invalid coupon code', { type: 'error' })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Invalid coupon code')
      setCouponError(msg)
      showToast(msg, { type: 'error' })
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    showToast('Coupon removed')
  }

  const handleUpdateQty = async (item, delta) => {
    const currentQty = Number(item.quantity)
    const nextQty = currentQty + delta
    setBusyProductId(item.product_id)
    try {
      if (nextQty <= 0) {
        await removeItem(item.product_id, item.cart_item_id)
        showToast(`Removed ${item.name} from cart`)
      } else {
        await updateQuantity(item.product_id, nextQty, item.cart_item_id)
      }
    } finally {
      setBusyProductId(null)
    }
  }

  const handleRemoveItem = async (item) => {
    setBusyProductId(item.product_id)
    try {
      await removeItem(item.product_id, item.cart_item_id)
      showToast(`Removed ${item.name} from cart`)
    } finally {
      setBusyProductId(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    await clearCart()
    showToast('Cart cleared')
  }

  const summary = (
    <div className="overflow-hidden rounded-3xl border border-cream-300 bg-cream-50 shadow-xs">
      <div className="border-b border-cream-300 bg-cream-100 px-6 py-4">
        <h2 className="font-serif text-lg font-bold text-ink-900">Order Summary</h2>
      </div>

      <div className="p-6 space-y-5">
        {/* Coupon Code Section */}
        <div>
          <label className="text-xs font-semibold text-ink-700 flex items-center gap-1.5 mb-2">
            <Ticket className="h-4 w-4 text-chili-600" />
            <span>Have a Coupon Code?</span>
          </label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-xl bg-success-100 p-3 border border-success-500/30">
              <div>
                <span className="font-mono text-xs font-bold text-success-500">
                  {appliedCoupon.coupon?.code || 'COUPON'}
                </span>
                <p className="text-[11px] text-success-500 font-medium">
                  {appliedCoupon.message || `Saved ₹${discountAmount}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-bold text-chili-600 hover:text-chili-700 underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl border border-cream-300 bg-cream-100 px-3.5 py-2 text-xs font-mono uppercase text-ink-900 focus:border-chili-500 outline-none"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={couponLoading || !couponInput.trim()}
                loading={couponLoading}
              >
                Apply
              </Button>
            </form>
          )}
          {couponError ? (
            <p className="mt-1.5 text-xs font-semibold text-chili-600">{couponError}</p>
          ) : null}
        </div>

        {/* Price Calculations */}
        <div className="space-y-2.5 border-t border-cream-300 pt-4 text-xs">
          <div className="flex items-center justify-between text-ink-500">
            <span>Item Subtotal</span>
            <span className="font-semibold text-ink-900 tabular-nums">₹{Number(totalAmount).toFixed(0)}</span>
          </div>

          {discountAmount > 0 ? (
            <div className="flex items-center justify-between text-success-500">
              <span>Coupon Discount</span>
              <span className="font-bold tabular-nums">-₹{discountAmount.toFixed(0)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-ink-500">
            <span>Delivery Fee</span>
            <span className="font-bold text-success-500">FREE</span>
          </div>

          <div className="flex items-center justify-between border-t border-cream-300 pt-3 text-sm">
            <span className="font-serif font-bold text-ink-900">Total Payable</span>
            <span className="font-serif text-xl font-bold text-chili-600 tabular-nums">
              ₹{grandTotal.toFixed(0)}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() =>
            navigate('/checkout', {
              state: { appliedCoupon, discountAmount },
            })
          }
          className="w-full"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center font-serif text-[11px] italic text-chili-600">
          “Safe, as your mother's home.”
        </p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Your Shopping Cart" />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Loading your cart items…</p>
        </div>
      </AppShell>
    )
  }

  if (isError) {
    return (
      <AppShell>
        <PageHeader title="Your Shopping Cart" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-base font-bold text-chili-600">Could not load your cart</p>
          <p className="mt-1 text-xs text-ink-500">Please refresh the page and try again.</p>
        </div>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Your Shopping Cart" />
        <div className="py-12">
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Discover our traditional handmade pickles, aromatic podis, and wholesome meal boxes prepared with pure cold-pressed oils."
            actionLabel="Browse Our Delicacies"
            onAction={() => navigate('/')}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Your Shopping Cart" />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
          {/* Cart Items List */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-cream-300 pb-3 text-xs">
              <span className="font-semibold text-ink-700">
                {items.length} {items.length === 1 ? 'delicacy' : 'delicacies'} in your basket
              </span>
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="font-bold text-chili-600 hover:text-chili-700 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cart_item_id || item.product_id}
                  className="flex gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-xs transition-all duration-200 hover:border-chili-300 hover:shadow-md"
                >
                  <ProductImage
                    src={item.image_url}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-xl object-cover border border-cream-300/60"
                  />
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-ink-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-ink-500 mt-0.5 tabular-nums">
                        ₹{Number(item.selling_price).toFixed(0)} {item.unit ? `/ ${item.unit}` : ''}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center rounded-lg border border-cream-300 bg-cream-100 p-0.5">
                        <button
                          onClick={() => handleUpdateQty(item, -1)}
                          disabled={busyProductId === item.product_id}
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded bg-cream-50 text-ink-900 hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-ink-900 tabular-nums">
                          {Number(item.quantity).toFixed(0)}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item, 1)}
                          disabled={busyProductId === item.product_id}
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded bg-cream-50 text-ink-900 hover:bg-cream-200 active:scale-95 transition-all focus-visible:outline-none"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        disabled={busyProductId === item.product_id}
                        aria-label="Remove item"
                        className="flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-chili-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-base font-bold text-chili-600 tabular-nums">
                      ₹{Number(item.item_total).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Promise Strip */}
            <div className="flex items-center gap-3 rounded-2xl border border-cream-300 bg-cream-100 p-4 text-xs text-ink-700">
              <ShieldCheck className="h-5 w-5 text-success-500 shrink-0" />
              <p>
                <strong className="font-semibold text-ink-900">Safe, as your mother's home:</strong> Every delicacy is packed hygienically with zero artificial preservatives and fresh dispatch.
              </p>
            </div>
          </div>

          {/* Desktop Summary Column */}
          <div className="hidden md:block md:col-span-5 lg:col-span-4">
            <div className="sticky top-24">{summary}</div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-3 md:hidden">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-cream-300 bg-cream-100/95 p-3.5 shadow-lg backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase font-semibold text-ink-500">Total</p>
            <p className="font-serif text-lg font-bold text-chili-600 tabular-nums">
              ₹{grandTotal.toFixed(0)}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/checkout', { state: { appliedCoupon, discountAmount } })}
            className="flex-1"
          >
            <span>Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppShell>
  )
}