import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, ShieldCheck, Ticket, ShoppingBag, ArrowRight } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'
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
      } else {
        setCouponError(res.message || 'Invalid coupon code')
      }
    } catch (err) {
      setCouponError(getApiErrorMessage(err, 'Invalid coupon code'))
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
    <div className="overflow-hidden rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] shadow-xs">
      <div className="border-b border-[#E6D9C5] bg-[#FAF6EF] px-5 py-3">
        <h2 className="font-serif text-base font-bold text-[#1C1917]">Order Summary</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* Coupon Code Section */}
        <div>
          <label className="text-xs font-semibold text-[#44403C] flex items-center gap-1.5 mb-1.5">
            <Ticket className="h-3.5 w-3.5 text-[#9B2C2C]" />
            <span>Have a Coupon Code?</span>
          </label>
          {appliedCoupon ? (
            <div className="flex items-center justify-between rounded-lg bg-[#DCFCE7] px-3 py-2 border border-[#86EFAC]">
              <div>
                <span className="font-mono text-xs font-bold text-[#15803D]">
                  {appliedCoupon.coupon?.code || 'COUPON'}
                </span>
                <p className="text-[11px] text-[#166534] font-medium">
                  {appliedCoupon.message || `Saved ₹${discountAmount}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs font-bold text-[#9B2C2C] hover:text-[#7B1F23]"
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
                className="flex-1 rounded-md border border-[#E6D9C5] bg-[#FAF6EF] px-3 py-1.5 text-xs font-mono uppercase text-[#1C1917] focus:border-[#9B2C2C] outline-none"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponInput.trim()}
                className="rounded-md bg-[#FAF6EF] border border-[#E6D9C5] px-3.5 py-1.5 text-xs font-bold text-[#9B2C2C] hover:bg-[#FDF2F2] disabled:opacity-50 transition-colors"
              >
                {couponLoading ? '…' : 'Apply'}
              </button>
            </form>
          )}
          {couponError ? (
            <p className="mt-1 text-xs font-semibold text-[#9B2C2C]">{couponError}</p>
          ) : null}
        </div>

        {/* Price Calculations */}
        <div className="space-y-2 border-t border-[#E6D9C5] pt-3 text-xs">
          <div className="flex items-center justify-between text-[#78716C]">
            <span>Item Subtotal</span>
            <span className="font-semibold text-[#1C1917]">₹{Number(totalAmount).toFixed(0)}</span>
          </div>

          {discountAmount > 0 ? (
            <div className="flex items-center justify-between text-[#15803D]">
              <span>Coupon Discount</span>
              <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-[#78716C]">
            <span>Delivery Fee</span>
            <span className="font-bold text-[#15803D]">FREE</span>
          </div>

          <div className="flex items-center justify-between border-t border-[#E6D9C5] pt-3 text-sm">
            <span className="font-serif font-bold text-[#1C1917]">Total Payable</span>
            <span className="font-serif text-lg font-bold text-[#9B2C2C]">
              ₹{grandTotal.toFixed(0)}
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            navigate('/checkout', {
              state: { appliedCoupon, discountAmount },
            })
          }
          className="w-full flex items-center justify-center gap-2 rounded-md bg-[#9B2C2C] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#7B1F23] active:scale-95 transition-all"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center font-serif text-[11px] italic text-[#78716C]">
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading your cart items…</p>
        </div>
      </AppShell>
    )
  }

  if (isError) {
    return (
      <AppShell>
        <PageHeader title="Your Shopping Cart" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-base font-bold text-[#9B2C2C]">Could not load your cart</p>
          <p className="mt-1 text-xs text-[#78716C]">Please refresh the page and try again.</p>
        </div>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Your Shopping Cart" />
        <div className="flex flex-col items-center px-4 py-20 text-center max-w-md mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FCE4E4] text-[#9B2C2C] shadow-inner">
            <ShoppingBag className="h-9 w-9 stroke-[1.5]" />
          </div>
          <h2 className="mt-5 font-serif text-2xl font-bold text-[#1C1917]">
            Your cart is empty
          </h2>
          <p className="mt-1.5 text-xs text-[#78716C] leading-relaxed">
            Discover our traditional handmade pickles, aromatic powders, and wholesome meals prepared with pure care.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#9B2C2C] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#7B1F23]"
          >
            <span>Browse Our Pickles & Menu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Your Shopping Cart" />

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
          {/* Cart Items List */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6D9C5] pb-2 text-xs">
              <span className="font-semibold text-[#44403C]">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </span>
              <button
                onClick={handleClearCart}
                disabled={isClearing}
                className="font-bold text-[#9B2C2C] hover:text-[#7B1F23] transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cart_item_id || item.product_id}
                  className="flex gap-4 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-3.5 shadow-2xs"
                >
                  <ProductImage
                    src={item.image_url}
                    alt={item.name}
                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#1C1917] truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        ₹{Number(item.selling_price).toFixed(0)} {item.unit ? `/ ${item.unit}` : ''}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-0.5">
                        <button
                          onClick={() => handleUpdateQty(item, -1)}
                          disabled={busyProductId === item.product_id}
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded bg-white text-[#1C1917] hover:bg-[#F3EBDD] active:scale-95 transition-all"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-[#1C1917] tabular-nums">
                          {Number(item.quantity).toFixed(0)}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item, 1)}
                          disabled={busyProductId === item.product_id}
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded bg-white text-[#1C1917] hover:bg-[#F3EBDD] active:scale-95 transition-all"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item)}
                        disabled={busyProductId === item.product_id}
                        aria-label="Remove item"
                        className="flex items-center gap-1 text-xs font-semibold text-[#A8A29E] hover:text-[#9B2C2C] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-serif text-base font-bold text-[#9B2C2C]">
                      ₹{Number(item.item_total).toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Promise Strip */}
            <div className="flex items-center gap-3 rounded-xl border border-[#E6D9C5] bg-[#FAF6EF] p-3 text-xs text-[#44403C]">
              <ShieldCheck className="h-5 w-5 text-[#15803D] shrink-0" />
              <p>
                <strong className="font-semibold text-[#1C1917]">Safe, as your mother's home:</strong> Every order is packed hygienically with zero artificial preservatives and fresh dispatch.
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
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E6D9C5] bg-[#FAF6EF]/95 p-3 shadow-lg backdrop-blur-md">
          <div>
            <p className="text-[10px] uppercase font-semibold text-[#78716C]">Total</p>
            <p className="font-serif text-lg font-bold text-[#9B2C2C]">
              ₹{grandTotal.toFixed(0)}
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout', { state: { appliedCoupon, discountAmount } })}
            className="flex-1 rounded-md bg-[#9B2C2C] py-2.5 px-4 text-xs font-bold text-white shadow-xs active:scale-95"
          >
            Checkout &rarr;
          </button>
        </div>
      </div>
    </AppShell>
  )
}