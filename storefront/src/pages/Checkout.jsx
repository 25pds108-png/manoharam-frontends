import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MapPin, ShieldCheck, CreditCard, Banknote, Edit3, Ticket, Bookmark, Lock } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import ProductImage from '../components/ProductImage'
import AddressBookModal from '../components/AddressBookModal'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkout, verifyPayment } from '../api/cart'
import { getApiErrorMessage } from '../api/client'

export default function Checkout() {
  const { items, totalAmount, isLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

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
        setIsPlacing(false)
        return
      }

      // If Razorpay order returned for ONLINE payment
      if (paymentMethod === 'ONLINE' && data.razorpay) {
        if (!window.Razorpay) {
          setError('Payment gateway failed to load. Please try again or choose Cash on Delivery.')
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
            color: '#9B2C2C',
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

              navigate(`/orders/${data.order_id}`, {
                replace: true,
                state: { justPlaced: true, paymentVerified: verifyRes.success },
              })
            } catch (err) {
              setError(getApiErrorMessage(err, 'Payment verification failed. Please contact support.'))
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
        navigate(`/orders/${data.order_id}`, {
          replace: true,
          state: { justPlaced: true },
        })
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not place order'))
      setIsPlacing(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Secure Checkout" />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#9B2C2C] border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-[#78716C]">Loading checkout details…</p>
        </div>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Secure Checkout" />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="font-serif text-lg font-bold text-[#1C1917]">Your cart is empty</p>
          <p className="mt-1 text-xs text-[#78716C]">
            Please add your favorite delicacies to your basket before checking out.
          </p>
        </div>
      </AppShell>
    )
  }

  const discountAmount = Number(appliedCoupon?.discount_amount || 0)
  const finalTotal = Math.max(0, Number(totalAmount) - discountAmount)

  return (
    <AppShell maxWidth="max-w-7xl">
      <PageHeader title="Secure Checkout" />

      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 lg:gap-10">
          {/* Main Checkout Steps Column */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5">
            {/* 1. Delivery Address Card */}
            <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#E6D9C5] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FCE4E4] text-[#9B2C2C]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h2 className="font-serif text-base font-bold text-[#1C1917]">
                    1. Delivery Address
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E6D9C5] bg-[#FAF6EF] px-2.5 py-1 text-xs font-bold text-[#44403C] hover:bg-[#F3EBDD] transition-colors"
                  >
                    <Bookmark className="h-3 w-3 text-[#9B2C2C]" />
                    <span>Saved Addresses</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(!isEditingAddress)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#9B2C2C] hover:text-[#7B1F23]"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isEditingAddress ? 'Done' : 'Edit'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-serif text-sm font-bold text-[#1C1917]">{user?.name}</p>
                <p className="text-xs text-[#78716C] mt-0.5">{user?.phone}</p>

                {isEditingAddress ? (
                  <div className="mt-3">
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your complete delivery address (Door No, Building, Street, Landmark, City, Pincode)..."
                      className="w-full rounded-md border border-[#E6D9C5] bg-[#FAF6EF] p-2.5 text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#9B2C2C] outline-none"
                    />
                  </div>
                ) : (
                  <p className="mt-2 rounded-lg bg-[#FAF6EF] p-3 text-xs leading-relaxed text-[#44403C] border border-[#E6D9C5]/60">
                    {deliveryAddress || 'No delivery address specified. Please click Edit or select from your saved addresses.'}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
              <div className="border-b border-[#E6D9C5] pb-3">
                <h2 className="font-serif text-base font-bold text-[#1C1917]">
                  2. Payment Method
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-[#9B2C2C] bg-[#FCE4E4]/40 ring-2 ring-[#9B2C2C]/20'
                      : 'border-[#E6D9C5] bg-[#FFFEFC] hover:bg-[#FAF6EF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Banknote className={`h-5 w-5 ${paymentMethod === 'COD' ? 'text-[#9B2C2C]' : 'text-[#78716C]'}`} />
                    <span className="font-serif text-sm font-bold text-[#1C1917]">
                      Cash on Delivery
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-snug">
                    Pay with cash or UPI directly to the delivery person.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex flex-col items-start gap-1.5 rounded-xl border p-4 text-left transition-all ${
                    paymentMethod === 'ONLINE'
                      ? 'border-[#9B2C2C] bg-[#FCE4E4]/40 ring-2 ring-[#9B2C2C]/20'
                      : 'border-[#E6D9C5] bg-[#FFFEFC] hover:bg-[#FAF6EF]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className={`h-5 w-5 ${paymentMethod === 'ONLINE' ? 'text-[#9B2C2C]' : 'text-[#78716C]'}`} />
                    <span className="font-serif text-sm font-bold text-[#1C1917]">
                      Online Payment
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-snug">
                    Instant & secure checkout via Razorpay (UPI, GPay, PhonePe, Cards, NetBanking).
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Items in Order */}
            <div className="rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
              <h2 className="border-b border-[#E6D9C5] pb-3 font-serif text-base font-bold text-[#1C1917]">
                3. Order Items ({items.length})
              </h2>
              <div className="divide-y divide-[#E6D9C5]/60">
                {items.map((item) => (
                  <div key={item.cart_item_id || item.product_id} className="flex items-center gap-3.5 py-3">
                    <ProductImage
                      src={item.image_url}
                      alt={item.name}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-bold text-[#1C1917] truncate">{item.name}</p>
                      <p className="text-xs text-[#78716C]">Qty {item.quantity} {item.unit ? `• ${item.unit}` : ''}</p>
                    </div>
                    <span className="font-serif text-sm font-bold text-[#9B2C2C] shrink-0">
                      ₹{Number(item.item_total).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe Promise */}
            <div className="flex items-center gap-3 rounded-xl border border-[#E6D9C5] bg-[#DCFCE7]/50 p-3.5 text-xs text-[#166534]">
              <ShieldCheck className="h-5 w-5 text-[#15803D] shrink-0" />
              <p>
                <strong className="font-semibold text-[#15803D]">Safe, as your mother's home:</strong> Freshly packed from our kitchen with zero artificial preservatives.
              </p>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="sticky top-24 rounded-xl border border-[#E6D9C5] bg-[#FFFEFC] p-5 shadow-xs">
              <h2 className="font-serif text-base font-bold text-[#1C1917] border-b border-[#E6D9C5] pb-3">
                Payment Summary
              </h2>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#78716C]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#1C1917]">₹{Number(totalAmount).toFixed(0)}</span>
                </div>

                {discountAmount > 0 ? (
                  <div className="flex items-center justify-between text-[#15803D]">
                    <span className="flex items-center gap-1">
                      <Ticket className="h-3 w-3" /> Coupon ({appliedCoupon.coupon?.code})
                    </span>
                    <span className="font-bold">-₹{discountAmount.toFixed(0)}</span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-[#78716C]">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-[#15803D]">FREE</span>
                </div>

                <div className="flex items-center justify-between border-t border-[#E6D9C5] pt-3 text-sm">
                  <span className="font-serif font-bold text-[#1C1917]">Total Payable</span>
                  <span className="font-serif text-xl font-bold text-[#9B2C2C]">
                    ₹{finalTotal.toFixed(0)}
                  </span>
                </div>
              </div>

              {error ? (
                <p className="mt-3 text-center text-xs font-semibold text-[#9B2C2C] bg-[#FDF2F2] p-2 rounded">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isPlacing}
                className="mt-5 w-full flex items-center justify-center gap-2 rounded-md bg-[#9B2C2C] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#7B1F23] active:scale-95 transition-all"
              >
                <Lock className="h-4 w-4" />
                <span>
                  {isPlacing
                    ? 'Processing…'
                    : paymentMethod === 'ONLINE'
                    ? `Pay ₹${finalTotal.toFixed(0)} Online`
                    : 'Confirm Order (COD)'}
                </span>
              </button>

              <p className="mt-3 text-center text-[11px] text-[#78716C]">
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
