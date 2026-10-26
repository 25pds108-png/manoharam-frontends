import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShieldCheck, Loader2, Ticket } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'
import { applyCoupon } from '../api/coupons'
import { getApiErrorMessage } from '../api/client'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LOTTIE_MAX_WAIT_MS = 2000

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
  const [busyProductId, setBusyProductId] = useState(null)
  const [lottieReady, setLottieReady] = useState(false)

  // Show a spinner over the empty-state animation until it loads, but never
  // block the UI on it for more than LOTTIE_MAX_WAIT_MS.
  useEffect(() => {
    if (lottieReady) return
    const timeout = setTimeout(() => setLottieReady(true), LOTTIE_MAX_WAIT_MS)
    return () => clearTimeout(timeout)
  }, [lottieReady])

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState(null)

  const deliveryFee = items.length > 0 ? 0 : 0 // free delivery — adjust here if/when that changes
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
      } else {
        setCouponError(res.message || 'Invalid coupon')
      }
    } catch (err) {
      setCouponError(getApiErrorMessage(err, 'Invalid coupon'))
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
  }

  const handleUpdateQty = async (item, delta) => {
    const currentQty = Number(item.quantity)
    const nextQty = currentQty + delta
    setBusyProductId(item.product_id)
    try {
      if (nextQty <= 0) {
        await removeItem(item.product_id, item.cart_item_id)
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
    } finally {
      setBusyProductId(null)
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    await clearCart()
  }

  const summary = (
    <Card className="overflow-hidden">
      <div className="space-y-3 p-5">
        {/* Coupon Code Input */}
        <div>
          <label className="text-xs font-semibold text-ink-700 flex items-center gap-1">
            <Ticket className="h-3.5 w-3.5 text-chili-500" /> Have a Coupon?
          </label>
          {appliedCoupon ? (
            <div className="mt-1.5 flex items-center justify-between rounded-xl bg-success-50 px-3 py-2 border border-success-200">
              <div>
                <span className="font-mono text-xs font-bold text-success-800">
                  {appliedCoupon.coupon?.code || 'COUPON'}
                </span>
                <p className="text-[11px] text-success-700 font-medium">
                  {appliedCoupon.message || `Saved ₹${discountAmount}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-semibold text-chili-600 hover:text-chili-800"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="mt-1.5 flex gap-1.5">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl border border-cream-300 px-3 py-1.5 text-xs font-mono uppercase text-ink-900 focus:border-chili-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponInput.trim()}
                className="rounded-xl bg-cream-100 px-3 py-1.5 text-xs font-semibold text-chili-600 hover:bg-cream-200 disabled:opacity-50 transition-colors"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </form>
          )}
          {couponError ? (
            <p className="mt-1 text-[11px] font-medium text-chili-600">{couponError}</p>
          ) : null}
        </div>

        <div className="space-y-2 pt-2 border-t border-cream-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Subtotal</span>
            <span className="font-medium text-ink-900">₹{Number(totalAmount).toFixed(0)}</span>
          </div>
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between text-sm text-success-600">
              <span>Coupon Discount</span>
              <span className="font-medium">-₹{discountAmount.toFixed(0)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Delivery</span>
            <span className="font-medium text-success-500">Free</span>
          </div>
          <div className="flex items-center justify-between border-t border-cream-200 pt-3">
            <span className="font-display text-base font-semibold text-ink-900">Total</span>
            <span className="font-display text-lg font-semibold text-chili-500">
              ₹{grandTotal.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
      <Button
        onClick={() =>
          navigate('/checkout', {
            state: { appliedCoupon, discountAmount },
          })
        }
        className="w-full rounded-none rounded-b-card py-4"
      >
        Proceed to checkout
      </Button>
    </Card>
  )

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Your cart" />
        <p className="px-4 py-16 text-center text-ink-300">Loading your cart…</p>
      </AppShell>
    )
  }

  if (isError) {
    return (
      <AppShell>
        <PageHeader title="Your cart" />
        <p className="px-4 py-16 text-center text-chili-500">
          Couldn't load your cart. Pull down to retry.
        </p>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Your cart" />
        <div className="flex flex-col items-center px-4 py-20 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-chili-50 text-chili-300">
            {!lottieReady ? (
              <Loader2
                className="absolute h-6 w-6 animate-spin text-chili-300"
                aria-hidden="true"
              />
            ) : null}
            <DotLottieReact
              src="https://lottie.host/256eb85b-d1f1-4c39-a564-7eb1b342d7a3/hS1dnkcupa.lottie"
              loop
              autoplay
              onLoad={() => setLottieReady(true)}
              className={`h-20 w-20 transition-opacity duration-300 ${
                lottieReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold text-ink-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Fresh bowls are just a tap away — let's fix that.
          </p>
          <Link to="/">
            <Button className="mt-5">Browse the menu</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title="Your cart" />

      <div className="px-4 md:flex md:gap-8">
        <div className="md:flex-1">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-sm text-ink-500">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
            <button
              onClick={handleClearCart}
              disabled={isClearing}
              className="text-xs font-medium text-ink-400 hover:text-chili-500 transition-colors"
            >
              Clear cart
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.cart_item_id || item.product_id} className="flex gap-3 p-3">
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  className="h-16 w-16 shrink-0 rounded-xl"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink-900 truncate">{item.name}</p>
                  <p className="text-sm text-ink-500">
                    ₹{Number(item.selling_price).toFixed(0)} {item.unit ? `/ ${item.unit}` : ''}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 rounded-pill border border-cream-300 bg-cream-50 px-2 py-0.5">
                      <button
                        onClick={() => handleUpdateQty(item, -1)}
                        disabled={busyProductId === item.product_id}
                        aria-label="Decrease quantity"
                        className="rounded-full p-1 text-ink-500 hover:bg-cream-200 disabled:opacity-50 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-semibold text-ink-900">
                        {Number(item.quantity).toFixed(0)}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item, 1)}
                        disabled={busyProductId === item.product_id}
                        aria-label="Increase quantity"
                        className="rounded-full p-1 text-ink-500 hover:bg-cream-200 disabled:opacity-50 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item)}
                      disabled={busyProductId === item.product_id}
                      aria-label="Remove item"
                      className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-chili-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
                <p className="self-center font-display font-semibold text-ink-900 shrink-0">
                  ₹{Number(item.item_total).toFixed(0)}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-cream-100 p-3.5 text-xs text-ink-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
            <p>
              Prepared fresh daily with traditional recipes and authentic ingredients. Free delivery on all orders.
            </p>
          </div>
        </div>

        {/* Order summary — sticky sidebar on desktop, floating bar on mobile */}
        <div className="hidden md:block md:w-80 md:shrink-0">
          <div className="sticky top-20">{summary}</div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-20 z-30 mx-auto max-w-md px-4 md:hidden">
        <Card className="flex items-center justify-between p-4 shadow-lg shadow-ink-900/10">
          <div>
            <p className="text-xs text-ink-300">Total</p>
            <p className="font-display text-lg font-semibold text-ink-900">
              ₹{grandTotal.toFixed(0)}
            </p>
          </div>
          <Button onClick={() => navigate('/checkout')}>Checkout</Button>
        </Card>
      </div>
    </AppShell>
  )
}