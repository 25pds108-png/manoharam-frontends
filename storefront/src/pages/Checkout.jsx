import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MapPin, ShieldCheck, CreditCard, Banknote, Edit3, Ticket, Bookmark, Lock, Check } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductImage from '../components/ProductImage'
import AddressBookModal from '../components/AddressBookModal'
import Button from '../components/ui/Button'
import { HorizontalStepper } from '../components/ui/Stepper'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { checkout, verifyPayment } from '../api/cart'
import { getApiErrorMessage } from '../api/client'

const CHECKOUT_STEPS = [
  { label: 'Basket' },
  { label: 'Delivery' },
  { label: 'Payment' },
]

export default function Checkout() {
  const { items, totalAmount, isLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')
  const [isEditingAddress, setIsEditingAddress] = useState(!user?.address)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [appliedCoupon] = useState(location.state?.appliedCoupon || null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState(null)

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      setError('Please provide a delivery address before placing your order.')
      showToast('Please provide a delivery address', { type: 'error' })
      setIsEditingAddress(true)
      return
    }

    setError(null)
    setIsPlacing(true)

    try {
      const data = await checkout({
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
      })

      if (!data.success) {
        setError(data.message || 'Could not place order')
        showToast(data.message || 'Could not place order', { type: 'error' })
        setIsPlacing(false)
        return
      }

      // If Razorpay order returned for ONLINE payment
      if (paymentMethod === 'ONLINE' && data.razorpay) {
        if (!window.Razorpay) {
          setError('Payment gateway failed to load. Please try again or choose Cash on Delivery.')
          showToast('Payment gateway failed to load', { type: 'error' })
          setIsPlacing(false)
          return
        }

        const options = {
          key: data.razorpay.key,
          amount: data.razorpay.amount,
          currency: data.razorpay.currency || 'INR',
          name: 'Manoharam Real Foods',
          description: `Order #${data.order_id}`,
          order_id: data.razorpay.razorpay_order_id,
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#9B2C2C', // Primary brand chili-600 token for Razorpay
          },
          handler: async function (response) {
            try {
              const verifyRes = await verifyPayment({
                order_id: data.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })

              queryClient.invalidateQueries({ queryKey: ['cart'] })
              queryClient.invalidateQueries({ queryKey: ['orders'] })
              showToast('Payment verified successfully!')

              navigate(`/orders/${data.order_id}`, {
                replace: true,
                state: { justPlaced: true, paymentVerified: verifyRes.success },
              })
            } catch (err) {
              const msg = getApiErrorMessage(err, 'Payment verification failed. Please contact support.')
              setError(msg)
              showToast(msg, { type: 'error' })
            }
          },
          modal: {
            ondismiss: function () {
              setIsPlacing(false)
              navigate(`/orders/${data.order_id}`, {
                replace: true,
                state: { justPlaced: true, paymentPending: true },
              })
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        // COD or instant confirmation
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        showToast('Order placed successfully!')
        navigate(`/orders/${data.order_id}`, {
          replace: true,
          state: { justPlaced: true },
        })
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not place order')
      setError(msg)
      showToast(msg, { type: 'error' })
      setIsPlacing(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Secure Checkout" />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-chili-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-ink-500">Loading checkout details…</p>
        </div>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Secure Checkout" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-xl font-bold text-ink-900">Your basket is empty</p>
          <p className="mt-2 text-xs text-ink-500">
            Please add your favorite delicacies to your basket before checking out.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/')} className="mt-6">
            Explore Menu
          </Button>
        </div>
      </AppShell>
    )
  }

  const discountAmount = Number(appliedCoupon?.discount_amount || 0)
  const finalTotal = Math.max(0, Number(totalAmount) - discountAmount)

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Secure Checkout" />

      <div className="animate-fade-in-up px-4 py-4 sm:px-6 lg:px-8 space-y-6">
        {/* Checkout Progress Stepper */}
        <div className="mx-auto max-w-xl pb-2">
          <HorizontalStepper steps={CHECKOUT_STEPS} currentStep={2} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
          {/* Main Checkout Steps Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            {/* 1. Delivery Address Card */}
            <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-cream-300 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chili-100 text-chili-600">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-ink-900">
                    1. Delivery Destination
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <Bookmark className="h-3.5 w-3.5 text-chili-600" />
                    <span>Saved Addresses</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="text-chili-600"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>{isEditingAddress ? 'Done' : 'Edit'}</span>
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-serif text-base font-bold text-ink-900">{user?.name}</p>
                <p className="text-xs text-ink-500 mt-0.5">{user?.phone}</p>

                {isEditingAddress ? (
                  <div className="mt-3">
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address (Door No, Building, Street, Landmark, City, Pincode)..."
                      className="w-full rounded-2xl border border-cream-300 bg-cream-100 p-3.5 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:border-chili-500 focus:ring-1 focus:ring-chili-500 outline-none"
                    />
                  </div>
                ) : (
                  <p className="mt-3 rounded-2xl bg-cream-100 p-4 text-xs leading-relaxed text-ink-700 border border-cream-300/80">
                    {deliveryAddress || 'No delivery address specified. Please click Edit or select from your saved address book.'}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-4">
              <div className="border-b border-cream-300 pb-4">
                <h2 className="font-serif text-lg font-bold text-ink-900">
                  2. Choose Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`relative flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-chili-600 bg-chili-50 shadow-xs ring-1 ring-chili-600/30'
                      : 'border-cream-300 bg-cream-50 hover:bg-cream-100'
                  }`}
                >
                  {paymentMethod === 'COD' ? (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-chili-600 text-cream-50">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : null}
                  <div className="flex items-center gap-2.5">
                    <Banknote className={`h-5 w-5 ${paymentMethod === 'COD' ? 'text-chili-600' : 'text-ink-500'}`} />
                    <span className="font-serif text-base font-bold text-ink-900">
                      Cash on Delivery
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 leading-relaxed">
                    Pay with cash or UPI directly to the courier partner upon arrival.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`relative flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-chili-600 bg-chili-50 shadow-xs ring-1 ring-chili-600/30'
                      : 'border-cream-300 bg-cream-50 hover:bg-cream-100'
                  }`}
                >
                  {paymentMethod === 'ONLINE' ? (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-chili-600 text-cream-50">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : null}
                  <div className="flex items-center gap-2.5">
                    <CreditCard className={`h-5 w-5 ${paymentMethod === 'ONLINE' ? 'text-chili-600' : 'text-ink-500'}`} />
                    <span className="font-serif text-base font-bold text-ink-900">
                      Online Payment
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 leading-relaxed">
                    Instant & secure checkout via Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Items in Order */}
            <div className="rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-4">
              <h2 className="border-b border-cream-300 pb-4 font-serif text-lg font-bold text-ink-900">
                3. Delicacies in Order ({items.length})
              </h2>
              <div className="divide-y divide-cream-300/60">
                {items.map((item) => (
                  <div key={item.cart_item_id || item.product_id} className="flex items-center gap-4 py-3.5">
                    <ProductImage
                      src={item.image_url}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-cream-300/60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-bold text-ink-900 truncate">{item.name}</p>
                      <p className="text-xs text-ink-500 mt-0.5">Qty {item.quantity} {item.unit ? `• ${item.unit}` : ''}</p>
                    </div>
                    <span className="font-serif text-base font-bold text-chili-600 shrink-0 tabular-nums">
                      ₹{Number(item.item_total).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Promise */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-success-500/30 bg-success-100 p-4 text-xs text-success-500">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p>
                <strong className="font-semibold text-ink-900">Safe, as your mother's home:</strong> Freshly packed from our kitchen with zero artificial preservatives.
              </p>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-cream-300 bg-cream-50 p-6 shadow-xs space-y-5">
              <h2 className="font-serif text-lg font-bold text-ink-900 border-b border-cream-300 pb-4">
                Payment Breakdown
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-ink-500">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-ink-900 tabular-nums">₹{Number(totalAmount).toFixed(0)}</span>
                </div>

                {discountAmount > 0 ? (
                  <div className="flex items-center justify-between text-success-500">
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" /> Coupon ({appliedCoupon.coupon?.code})
                    </span>
                    <span className="font-bold tabular-nums">-₹{discountAmount.toFixed(0)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-ink-500">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-success-500">FREE</span>
                </div>

                <div className="flex items-center justify-between border-t border-cream-300 pt-3 text-sm">
                  <span className="font-serif font-bold text-ink-900">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-chili-600 tabular-nums">
                    ₹{finalTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {error ? (
                <p className="text-center text-xs font-semibold text-chili-600 bg-chili-50 border border-chili-200 p-3 rounded-xl">
                  {error}
                </p>
              ) : null}

              <Button
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                loading={isPlacing}
                className="w-full"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isPlacing
                    ? 'Processing…'
                    : paymentMethod === 'ONLINE'
                    ? `Pay ₹${finalTotal.toFixed(0)} Online`
                    : 'Confirm Order (COD)'}
                </span>
              </Button>

              <p className="text-center text-[11px] text-ink-400">
                🔒 256-bit SSL encrypted & Razorpay verified
              </p>
            </div>
          </div>
        </div>
      </div>

      <AddressBookModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={(selected) => {
          setDeliveryAddress(selected)
          setIsEditingAddress(false)
        }}
      />
    </AppShell>
  )
}
