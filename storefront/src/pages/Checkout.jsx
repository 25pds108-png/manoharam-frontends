import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { MapPin, ShieldCheck, CreditCard, Banknote, Edit3, Ticket, Bookmark } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
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
            color: '#C1272D',
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
        <PageHeader title="Checkout" />
        <p className="px-4 py-16 text-center text-ink-300">Loading…</p>
      </AppShell>
    )
  }

  if (items.length === 0) {
    return (
      <AppShell>
        <PageHeader title="Checkout" />
        <p className="px-4 py-16 text-center text-ink-500">
          Your cart is empty — add something fresh before checking out.
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <PageHeader title="Checkout" />

      <div className="px-4 md:mx-auto md:max-w-2xl md:flex md:gap-8">
        <div className="md:flex-1">
          {/* Delivery details */}
          <Card className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-chili-500" />
                <h2 className="font-display text-sm font-semibold text-ink-900">
                  Delivering to
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-ink-600 bg-cream-100 px-2.5 py-1 rounded-pill hover:bg-cream-200 transition-colors"
                >
                  <Bookmark className="h-3 w-3 text-chili-500" />
                  Saved Addresses
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="flex items-center gap-1 text-xs font-semibold text-chili-500 hover:text-chili-600"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingAddress ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>

            <p className="mt-2 text-sm font-medium text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-500">{user?.phone}</p>

            {isEditingAddress ? (
              <div className="mt-2.5">
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address (Street, Door No, Area, Pincode)..."
                  className="w-full rounded-xl border border-cream-300 p-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-chili-500 focus:outline-none"
                />
              </div>
            ) : (
              <p className="text-sm text-ink-700 mt-1">
                {deliveryAddress || 'No address set yet — click Edit or select a saved address.'}
              </p>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="mt-4 p-4">
            <h2 className="font-display text-sm font-semibold text-ink-900">Payment method</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <Banknote className={`h-5 w-5 ${paymentMethod === 'COD' ? 'text-chili-500' : 'text-ink-400'}`} />
                <span className="font-display text-sm font-semibold text-ink-900">Cash on Delivery</span>
                <span className="text-[11px] text-ink-500">Pay cash or UPI upon delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-chili-500 bg-chili-50/50 ring-2 ring-chili-500/20'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <CreditCard className={`h-5 w-5 ${paymentMethod === 'ONLINE' ? 'text-chili-500' : 'text-ink-400'}`} />
                <span className="font-display text-sm font-semibold text-ink-900">Pay Online</span>
                <span className="text-[11px] text-ink-500">UPI, Cards, NetBanking (Razorpay)</span>
              </button>
            </div>
          </Card>

          {/* Order items */}
          <Card className="mt-4 divide-y divide-cream-100 p-4">
            <h2 className="pb-3 font-display text-sm font-semibold text-ink-900">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </h2>
            {items.map((item) => (
              <div key={item.cart_item_id || item.product_id} className="flex items-center gap-3 py-3">
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  className="h-12 w-12 shrink-0 rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{item.name}</p>
                  <p className="text-xs text-ink-400">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-ink-900 shrink-0">
                  ₹{Number(item.item_total).toFixed(0)}
                </p>
              </div>
            ))}
          </Card>

          <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-success-50 p-3.5 text-xs text-success-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
            <p>100% natural, preservative-free foods. Delivery guaranteed on schedule.</p>
          </div>
        </div>

        <div className="mt-4 md:mt-0 md:w-72 md:shrink-0">
          <Card className="p-5">
            <h2 className="font-display text-sm font-semibold text-ink-900">Bill summary</h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">Subtotal</span>
                <span className="font-medium text-ink-900">
                  ₹{Number(totalAmount).toFixed(0)}
                </span>
              </div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between text-sm text-success-600">
                  <span className="flex items-center gap-1">
                    <Ticket className="h-3.5 w-3.5" /> Coupon ({appliedCoupon.coupon?.code})
                  </span>
                  <span className="font-semibold">-₹{Number(appliedCoupon.discount_amount || 0).toFixed(0)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">Delivery</span>
                <span className="font-medium text-success-600 font-semibold">Free</span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-cream-200 pt-3">
              <span className="font-display text-base font-semibold text-ink-900">
                Total
              </span>
              <span className="font-display text-lg font-semibold text-chili-500">
                ₹{Math.max(0, Number(totalAmount) - Number(appliedCoupon?.discount_amount || 0)).toFixed(0)}
              </span>
            </div>

            {error ? (
              <p className="mt-3 text-center text-xs font-medium text-chili-500">{error}</p>
            ) : null}

            <Button onClick={handlePlaceOrder} loading={isPlacing} className="mt-4 w-full">
              {paymentMethod === 'ONLINE' ? 'Pay & place order' : 'Place order'}
            </Button>
          </Card>
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

